// SPDX-License-Identifier: MIT
// Written by Coinsamba.com Team

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract StandardERC20 is ERC20Upgradeable {
    function initialize(
        address owner_,
        string calldata name_,
        string calldata symbol_,
        uint256 supply_
    ) external initializer {
        __ERC20_init(name_, symbol_);
        _mint(owner_, supply_);
    }
}
