pragma solidity >=0.6.8 <=0.7.6;

interface IOracleEth {

    // returns Q112-encoded value
    function assetToEth(address asset, uint amount) external view returns (uint);

    // returns the value "as is"
    function ethToUsd(uint amount) external view returns (uint);

    // returns the value "as is"
    function usdToEth(uint amount) external view returns (uint);
}