pragma solidity 0.7.6;

interface IOracleUsd {

    // returns Q112-encoded value
    function assetToUsd(address asset, uint amount) external view returns (uint);
}