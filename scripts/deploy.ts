import { ethers } from "hardhat";

const mintFee = ethers.constants.WeiPerEther.div(100);

async function main() {
  const StandardERC20Factory = await ethers.getContractFactory("StandardERC20");
  const StandardERC20 = await StandardERC20Factory.deploy();

  const TokenMakerFactory = await ethers.getContractFactory("TokenMaker");
  const TokenMaker = await TokenMakerFactory.deploy(
    StandardERC20.address,
    mintFee
  );

  await TokenMaker.deployed();

  console.log(`TokenMaker deployed to address ${TokenMaker.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
