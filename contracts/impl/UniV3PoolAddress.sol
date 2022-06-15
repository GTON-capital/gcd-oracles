// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma abicoder v2;

import "./uniswapV3Oracle/PoolAddress.sol";

contract UniV3PoolAddress {

    // Uniswap V3 factory
    address public constant factory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;

    function getPoolAddress(address base, address quote, uint24 fee) external pure returns (address pool) {
        PoolAddress.PoolKey memory poolKey = PoolAddress.getPoolKey(base, quote, fee);
        return PoolAddress.computeAddress(factory, poolKey);
    }
}
