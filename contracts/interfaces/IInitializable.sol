// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title IInitializable
/// @author Coinsamba Team
/// @notice Initializable interface for token maker
interface IInitializable {
    function initialize(
        address owner,
        string calldata name,
        string calldata symbol,
        uint256 supply
    ) external;
}
