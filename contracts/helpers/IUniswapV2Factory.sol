// SPDX-License-Identifier: bsl-1.1
pragma solidity >=0.6.8 <=0.7.6;

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function createPair(address tokenA, address tokenB) external returns (address pair);
}
