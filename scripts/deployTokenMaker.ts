import { ethers } from "hardhat";

const mintFee = ethers.constants.WeiPerEther.div(100);

const standardErc20Address = "",
  mintableErc20Address = "";

async function main() {
  const TokenMakerFactory = await ethers.getContractFactory("TokenMaker");
  const TokenMaker = await TokenMakerFactory.deploy(
    standardErc20Address,
    mintableErc20Address,
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
