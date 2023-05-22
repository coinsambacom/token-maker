// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

import "../../contracts/MintableERC20.sol";
import "../../contracts/StandardERC20.sol";
import "../../contracts/TokenMaker.sol";

contract DbgEntry {
    event EvmPrint(string);

    constructor() {
        emit EvmPrint("DbgEntry.constructor");

        MintableERC20 mintableErc20 = new MintableERC20();
        StandardERC20 standardErc20 = new StandardERC20();

        TokenMaker tokenMaker = new TokenMaker(
            address(standardErc20),
            address(mintableErc20),
            1 ether / 100
        );

        emit EvmPrint("DbgEntry return");
    }
}
