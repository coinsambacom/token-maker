import { ethers } from "hardhat";
import fs from "fs";
import { jsonName, deployedAddresses } from "./utils";

const mintFee = ethers.utils.parseEther("0.01");

const [standardErc20Address, mintableErc20Address] = fs
  .readFileSync("tmp")
  .toString()
  .split(",");

async function main() {
  const TokenMakerFactory = await ethers.getContractFactory("TokenMaker");
  const TokenMaker = await TokenMakerFactory.deploy(
    standardErc20Address,
    mintableErc20Address,
    mintFee
  );

  await TokenMaker.deployed();

  console.log(`TokenMaker deployed to address ${TokenMaker.address}`);

  const network = await TokenMaker.provider.getNetwork();

  deployedAddresses[network.chainId] =
    TokenMaker.address;

  fs.writeFileSync(jsonName, JSON.stringify(deployedAddresses, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
