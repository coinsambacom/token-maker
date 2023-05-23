import fs from "fs";
import { run } from "hardhat";

const [standardErc20Address, mintableErc20Address] = fs
  .readFileSync("tmp")
  .toString()
  .split(",");

async function main() {
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
