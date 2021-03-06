// SPDX-License-Identifier: bsl-1.1

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import "../helpers/SafeMath.sol";
import "../helpers/IUniswapV2Pair.sol";
import "../helpers/IKeydonixOracleUsd.sol";
import "../helpers/IKeydonixOracleEth.sol";
import "../helpers/IOracleEth.sol";
import "../helpers/IOracleRegistry.sol";
import "../helpers/IVaultParameters.sol";


/**
 * @title ChainlinkedKeydonixOraclePoolToken
 * @dev Calculates the USD price of Uniswap LP tokens
 **/
contract ChainlinkedKeydonixOraclePoolToken is IKeydonixOracleUsd {
    using SafeMath for uint;

    uint public constant Q112 = 2 ** 112;

    address public immutable WETH;

    IOracleRegistry public immutable oracleRegistry;

    IVaultParameters public immutable vaultParameters;

    constructor(address _oracleRegistry, address _vaultParameters) public {
        require(_oracleRegistry != address(0), "GCD Protocol: ZERO_ADDRESS");
        require(_vaultParameters != address(0), "GCD Protocol: ZERO_ADDRESS");
        oracleRegistry = IOracleRegistry(_oracleRegistry);
        vaultParameters = IVaultParameters(_vaultParameters);
        WETH = IOracleRegistry(_oracleRegistry).WETH();
    }

    /**
     * @notice This function implements flashloan-resistant logic to determine USD price of Uniswap LP tokens
     * @notice Block number of merkle proof must be in range [MIN_BLOCKS_BACK ... MAX_BLOCKS_BACK] (see ChainlinkedKeydonixOracleMainAsset)
     * @notice Pair must be registered on Uniswap
     * @param asset The LP token address
     * @param amount Amount of asset
     * @param proofData The proof data of underlying token price
     * @return Q112 encoded price of asset in USD
     **/
    function assetToUsd(
        address asset,
        uint amount,
        UniswapOracle.ProofData calldata proofData
    )
        external
        override
        view
        returns (uint)
    {
        IUniswapV2Pair pair = IUniswapV2Pair(asset);
        address underlyingAsset;
        if (pair.token0() == WETH) {
            underlyingAsset = pair.token1();
        } else if (pair.token1() == WETH) {
            underlyingAsset = pair.token0();
        } else {
            revert("GCD Protocol: NOT_REGISTERED_PAIR");
        }

        uint eAvg = IKeydonixOracleEth(_selectOracle(underlyingAsset)).assetToEth(underlyingAsset, 1, proofData); // average price of 1 token in ETH

        (uint112 _reserve0, uint112 _reserve1,) = pair.getReserves();
        uint aPool; // current asset pool
        uint ePool; // current WETH pool
        if (pair.token0() == underlyingAsset) {
            aPool = uint(_reserve0);
            ePool = uint(_reserve1);
        } else {
            aPool = uint(_reserve1);
            ePool = uint(_reserve0);
        }

        uint eCurr = ePool.mul(Q112).div(aPool); // current price of 1 token in WETH
        uint ePoolCalc; // calculated WETH pool

        if (eCurr < eAvg) {
            // flashloan buying WETH
            uint sqrtd = ePool.mul((ePool).mul(9).add(
                aPool.mul(3988000).mul(eAvg).div(Q112)
            ));
            uint eChange = sqrt(sqrtd).sub(ePool.mul(1997)).div(2000);
            ePoolCalc = ePool.add(eChange);
        } else {
            // flashloan selling WETH
            uint a = aPool.mul(eAvg);
            uint b = a.mul(9).div(Q112);
            uint c = ePool.mul(3988000);
            uint sqRoot = sqrt(a.div(Q112).mul(b.add(c)));
            uint d = a.mul(3).div(Q112);
            uint eChange = ePool.sub(d.add(sqRoot).div(2000));
            ePoolCalc = ePool.sub(eChange);
        }

        uint num = ePoolCalc.mul(2).mul(amount);
        uint priceInEth;
        if (num > Q112) {
            priceInEth = num.div(pair.totalSupply()).mul(Q112);
        } else {
            priceInEth = num.mul(Q112).div(pair.totalSupply());
        }

        return IOracleEth(oracleRegistry.oracleByAsset(WETH)).ethToUsd(priceInEth);
    }

    function sqrt(uint x) internal pure returns (uint y) {
        if (x > 3) {
            uint z = x / 2 + 1;
            y = x;
            while (z < y) {
                y = z;
                z = (x / z + z) / 2;
            }
        } else if (x != 0) {
            y = 1;
        }
    }

    function _selectOracle(address asset) internal view returns (address oracle) {
        uint oracleType = _getOracleType(asset);
        require(oracleType != 0, "GCD Protocol: INVALID_ORACLE_TYPE");
        oracle = oracleRegistry.oracleByType(oracleType);
        require(oracle != address(0), "GCD Protocol: DISABLED_ORACLE");
    }

    function _getOracleType(address asset) internal view returns (uint) {
        uint[] memory keydonixOracleTypes = oracleRegistry.getKeydonixOracleTypes();
        for (uint i = 0; i < keydonixOracleTypes.length; i++) {
            if (vaultParameters.isOracleTypeEnabled(keydonixOracleTypes[i], asset)) {
                return keydonixOracleTypes[i];
            }
        }
        revert("GCD Protocol: NO_ORACLE_FOUND");
    }
}
