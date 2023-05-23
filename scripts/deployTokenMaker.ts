import { ethers } from "hardhat";
import fs from "fs";

const jsonName = "deployedtokenMakers.json";

const mintFee = ethers.constants.WeiPerEther.div(100);

const [standardErc20Address, mintableErc20Address] = fs
  .readFileSync("tmp")
  .toString()
  .split(",");

async function main() {
  const deployedAddresses: { [id: number]: string } = JSON.parse(
    fs.readFileSync(jsonName).toString()
  );

  const TokenMakerFactory = await ethers.getContractFactory("TokenMaker");
  const TokenMaker = await TokenMakerFactory.deploy(
    standardErc20Address,
    mintableErc20Address,
    mintFee
  );

  await TokenMaker.deployed();

  console.log(`TokenMaker deployed to address ${TokenMaker.address}`);

  deployedAddresses[(await TokenMaker.provider.getNetwork()).chainId] =
    TokenMaker.address;

  fs.writeFileSync(jsonName, JSON.stringify(deployedAddresses));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
