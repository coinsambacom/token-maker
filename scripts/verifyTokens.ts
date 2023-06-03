import { ethers, run } from "hardhat";
import { deployedAddresses } from "./utils";

async function main() {
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  const TokenMaker = await ethers.getContractAt(
    "TokenMaker",
    deployedAddresses[chainId]
  );

  const standardErc20Address = await TokenMaker.callStatic.standardERC20();
  const mintableErc20Address = await TokenMaker.callStatic.mintableERC20();

  await run("verify:verify", {
    address: standardErc20Address,
  });
  await run("verify:verify", {
    address: mintableErc20Address,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
