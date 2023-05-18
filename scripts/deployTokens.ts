import { ethers } from "hardhat";

async function main() {
  const StandardERC20Factory = await ethers.getContractFactory("StandardERC20");
  const StandardERC20 = await StandardERC20Factory.deploy();

  const MintableERC20Factory = await ethers.getContractFactory("MintableERC20");
  const MintableERC20 = await MintableERC20Factory.deploy();

  console.log(`StandardERC20 deployed to address ${StandardERC20.address}`);
  console.log(`MintableERC20 deployed to address ${MintableERC20.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
