import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import {
  BasicTokenCreatedEvent,
  TokenMaker,
  TokenMakerInterface,
} from "../typechain-types/contracts/TokenMaker";

const name = "Test Token",
  symbol = "TTK",
  decimals = 18,
  initialSupply = 21000000,
  mintFee = ethers.constants.WeiPerEther.div(10);

describe("TokenMaker", function () {
  const createToken = async (factory: TokenMaker) => {
    const StandardERC20Factory = await ethers.getContractFactory(
      "StandardERC20"
    );

    const tx = await factory.newStandardToken(
      name,
      symbol,
      decimals,
      initialSupply,
      {
        value: mintFee,
      }
    );

    const trans = await tx.wait();

    const address = (trans.events?.find(v => v.event == "BasicTokenCreated") as BasicTokenCreatedEvent).args[0];

    return StandardERC20Factory.attach(address);
  };

  async function deployContractsFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const StandardERC20Factory = await ethers.getContractFactory(
      "StandardERC20"
    );
    const StandardERC20 = await StandardERC20Factory.deploy();

    const TokenMakerFactory = await ethers.getContractFactory("TokenMaker");
    const TokenMaker = await TokenMakerFactory.deploy(
      StandardERC20.address,
      mintFee
    );

    return { TokenMaker, owner, otherAccount };
  }

  describe("TokenFactory", function () {
    it("Should create token", async function () {
      const { TokenMaker } = await loadFixture(deployContractsFixture);
      const tokenCreated = await createToken(TokenMaker);

      expect(await tokenCreated.symbol()).to.equal(symbol);
    });

    it("Should flush ETH balance", async function () {
      const { TokenMaker } = await loadFixture(deployContractsFixture);

      const balanceBefore = await ethers.provider.getBalance(TokenMaker.address);

      await createToken(TokenMaker);

      const balanceAfter = await ethers.provider.getBalance(TokenMaker.address);

      expect(balanceAfter).to.equal(mintFee);
      expect(balanceAfter).to.greaterThan(balanceBefore);

      await TokenMaker.flushETH();

      const balanceAfter2 = await ethers.provider.getBalance(TokenMaker.address);

      expect(balanceAfter2).to.equal(ethers.constants.Zero);
    });

    // it("Should not flush ETH balance", async function () {
    //   const { lock, lockedAmount } = await loadFixture(deployContractsFixture);

    //   expect(await ethers.provider.getBalance(lock.address)).to.equal(
    //     lockedAmount
    //   );
    // });
  });
});
