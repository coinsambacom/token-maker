// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MintableERC20 is ERC20Upgradeable, OwnableUpgradeable {
    function initialize(
        address owner_,
        string calldata name_,
        string calldata symbol_,
        uint256 initialSupply_
    ) external initializer {
        __ERC20_init(name_, symbol_);
        __Ownable_init();
        transferOwnership(owner_);
        _mint(owner_, initialSupply_);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
