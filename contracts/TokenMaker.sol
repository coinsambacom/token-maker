// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IInitializable.sol";

error IncorrectFee();

/// @title TokenMaker
/// @author Coinsamba Team
/// @notice Handles token creation inside the Coinsamba platform
contract TokenMaker is AccessControl {
    using SafeMath for uint256;

    /// @notice The standard token implementation address
    address public immutable standardERC20;
    /// @notice The mintable token implementation address
    address public immutable mintableERC20;

    uint256 public standardFee;
    uint256 public mintableFee;

    event TokenCreated(address indexed token, string name);
    event FeeChanged(address indexed sender, bool mintable, uint256 fee);
    
    event TokenFlushed(
        address indexed sender,
        address tokenContractAddress,
        uint256 amount
    );
    event EtherFlushed(address indexed sender, uint256 amount);


    constructor(
        address standardERC20_,
        address mintableERC20_,
        uint256 mintFee
    ) {
        standardERC20 = standardERC20_;
        mintableERC20 = mintableERC20_;
        mintableFee = standardFee = mintFee;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /// @dev Validates if the sent fee matches the required fee
    /// @param mintable Flag indicating whether the token being created is mintable or not
    function validateFee(bool mintable) private {
        uint256 mintFee = mintable ? mintableFee : standardFee;

        if (msg.value != mintFee) {
            revert IncorrectFee();
        }
    }

    /// @dev Flushes the contract's ETH balance to the sender
    function flushETH() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;

        Address.sendValue(payable(_msgSender()), balance);
        emit EtherFlushed(_msgSender(), balance);
    }

    /// @dev Flushes the specified ERC20 token balance to the sender
    /// @param tokenContractAddress The address of the ERC20 token contract
    function flushERC20(
        address tokenContractAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20 tokenContract = IERC20(tokenContractAddress);
        uint256 balance = tokenContract.balanceOf(address(this));

        tokenContract.transfer(_msgSender(), balance);
        emit TokenFlushed(_msgSender(), tokenContractAddress, balance);
    }

    /// @dev Changes the creation fee for either standard or mintable tokens
    /// @param newFee The new fee value
    /// @param mintable Flag indicating whether the fee change is for mintable tokens or not
    function changeCreationFee(
        uint256 newFee,
        bool mintable
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (mintable) {
            mintableFee = newFee;
        } else {
            standardFee = newFee;
        }
        emit FeeChanged(_msgSender(), mintable, newFee);
    }

    /// @dev Creates a new token with the specified parameters
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param supply The initial supply of the token
    /// @param mintable Flag indicating whether the token is mintable or not
    /// @param referrer The address of the referrer who will receive 1% of the fee
    function createToken(
        string calldata name,
        string calldata symbol,
        uint256 supply,
        bool mintable,
        address referrer
    ) external payable {
        validateFee(mintable);

        address clone = Clones.clone(mintable ? mintableERC20 : standardERC20);

        IInitializable(clone).initialize(_msgSender(), name, symbol, supply);

        emit TokenCreated(clone, name);

        // referrer will receive 1 percent of fee
        Address.sendValue(payable(referrer), msg.value.div(100));
    }
}
