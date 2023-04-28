// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./StandardERC20.sol";

contract TokenMaker is AccessControl {
    address public immutable standardERC20;
    uint256 public mintFee;

    event BasicTokenCreated(address indexed token, string name);
    event TokenFlushed(
        address sender,
        address tokenContractAddress,
        uint256 amount
    );
    event EtherFlushed(address sender, uint256 amount);
    event FeeChanged(address sender, uint256 fee);

    constructor(address standardERC20_, uint256 mintFee_) {
        standardERC20 = standardERC20_;
        mintFee = mintFee_;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function flushETH() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance > 0, "TokenFactory: zero ether balance");
        emit EtherFlushed(_msgSender(), address(this).balance);
        Address.sendValue(payable(_msgSender()), address(this).balance);
    }

    function flushERC20(
        address tokenContractAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20 tokenContract = IERC20(tokenContractAddress);
        uint256 contractBalance = tokenContract.balanceOf(address(this));
        require(contractBalance > 0, "TokenFactory: zero token balance");
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

    function newStandardToken(
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        uint256 initialSupply
    ) external payable {
        require(msg.value == mintFee, "wrong fee");
        address clone = Clones.clone(standardERC20);
        StandardERC20(clone).initialize(
            _msgSender(),
            name,
            symbol,
            initialSupply,
            decimals
        );
        emit BasicTokenCreated(clone, name);
    }
}
