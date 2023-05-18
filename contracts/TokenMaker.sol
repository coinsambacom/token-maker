// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./StandardERC20.sol";
import "./MintableERC20.sol";

error IncorrectFee();
error NoBalance();

contract TokenMaker is AccessControl {
    address public immutable standardERC20;
    address public immutable mintableERC20;

    uint256 public mintFee;

    event TokenCreated(address indexed token, string name);

    event TokenFlushed(
        address sender,
        address tokenContractAddress,
        uint256 amount
    );
    event EtherFlushed(address sender, uint256 amount);
    event FeeChanged(address sender, uint256 fee);

    constructor(
        address standardERC20_,
        address mintableERC20_,
        uint256 mintFee_
    ) {
        standardERC20 = standardERC20_;
        mintableERC20 = mintableERC20_;
        mintFee = mintFee_;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function validateFee() private {
        if (msg.value != mintFee) {
            revert IncorrectFee();
        }
    }

    function flushETH() external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(this).balance == 0) {
            revert NoBalance();
        }
        emit EtherFlushed(_msgSender(), address(this).balance);
        Address.sendValue(payable(_msgSender()), address(this).balance);
    }

    function flushERC20(
        address tokenContractAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20 tokenContract = IERC20(tokenContractAddress);
        uint256 contractBalance = tokenContract.balanceOf(address(this));
        if (contractBalance == 0) {
            revert NoBalance();
        }
        if (!tokenContract.transfer(_msgSender(), contractBalance)) {
            revert();
        }
        emit TokenFlushed(_msgSender(), tokenContractAddress, contractBalance);
    }

    function changeMintFee(
        uint256 newFee
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintFee = newFee;
        emit FeeChanged(_msgSender(), newFee);
    }

    function newStandardERC20(
        string calldata name,
        string calldata symbol,
        uint256 supply
    ) external payable {
        validateFee();

        address clone = Clones.clone(standardERC20);
        StandardERC20(clone).initialize(_msgSender(), name, symbol, supply);
        emit TokenCreated(clone, name);
    }

    function newMintableERC20(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply
    ) external payable {
        validateFee();

        address clone = Clones.clone(mintableERC20);
        MintableERC20(clone).initialize(
            _msgSender(),
            name,
            symbol,
            initialSupply
        );
        emit TokenCreated(clone, name);
    }
}
