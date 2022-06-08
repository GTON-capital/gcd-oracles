// SPDX-License-Identifier: bsl-1.1

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
pragma solidity >=0.6.8 <=0.7.6;

interface IAggregatorInterface {
    function latestAnswer() external view returns (int256); // deprecated
    function latestTimestamp() external view returns (uint256); // deprecated
    function latestRound() external view returns (uint256);
    function decimals() external view returns (uint256);

    function latestRoundData()
    external
    view
    returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}
