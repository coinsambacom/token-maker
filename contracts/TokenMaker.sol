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
/// @notice Handle token creation inside Coinsamba platform
contract TokenMaker is AccessControl {
    using SafeMath for uint256;

    /// @notice The standard token implementation address
    address public immutable standardERC20;
    /// @notice The mintable token implementation address
    address public immutable mintableERC20;

    uint256 public standardFee;
    uint256 public mintableFee;

    event TokenCreated(address indexed token, string name);

    event TokenFlushed(
        address sender,
        address tokenContractAddress,
        uint256 amount
    );
    event EtherFlushed(address sender, uint256 amount);
    event FeeChanged(address sender, bool mintable, uint256 fee);

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

    function validateFee(bool mintable) private {
        uint256 mintFee = mintable ? mintableFee : standardFee;

        if (msg.value != mintFee) {
            revert IncorrectFee();
        }
    }

    function flushETH() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 contractBalance = address(this).balance;

        Address.sendValue(payable(_msgSender()), contractBalance);
        emit EtherFlushed(_msgSender(), contractBalance);
    }

    function flushERC20(
        address tokenContractAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20 tokenContract = IERC20(tokenContractAddress);
        uint256 contractBalance = tokenContract.balanceOf(address(this));

        if (!tokenContract.transfer(_msgSender(), contractBalance)) {
            revert();
        }
        emit TokenFlushed(_msgSender(), tokenContractAddress, contractBalance);
    }

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
