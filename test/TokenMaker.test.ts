import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  BasicTokenCreatedEvent,
  TokenMaker,
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

    const address = (
      trans.events?.find(
        (v) => v.event == "BasicTokenCreated"
      ) as BasicTokenCreatedEvent
    ).args[0];

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

    return { TokenMaker, StandardERC20, owner, otherAccount };
  }

  describe("TokenFactory", function () {
    it("Should has correct initial values", async function () {
      const { TokenMaker, StandardERC20 } = await loadFixture(
        deployContractsFixture
      );

      expect(await TokenMaker.mintFee()).to.equal(mintFee);
      expect(await TokenMaker.standardERC20()).to.equal(StandardERC20.address);
    });

    it("Should create token", async function () {
      const { TokenMaker } = await loadFixture(deployContractsFixture);
      const tokenCreated = await createToken(TokenMaker);

      expect(await tokenCreated.symbol()).to.equal(symbol);
    });

    it("Should flush ETH balance", async function () {
      const { TokenMaker, owner } = await loadFixture(deployContractsFixture);

      const balanceBefore = await ethers.provider.getBalance(
        TokenMaker.address
      );

      await createToken(TokenMaker);

      const balanceAfter = await ethers.provider.getBalance(TokenMaker.address);

      expect(balanceAfter).to.equal(mintFee);
      expect(balanceAfter).to.greaterThan(balanceBefore);

      await expect(TokenMaker.flushETH())
        .to.emit(TokenMaker, "EtherFlushed")
        .withArgs(owner.address, balanceAfter);

      const balanceAfter2 = await ethers.provider.getBalance(
        TokenMaker.address
      );

      expect(balanceAfter2).to.equal(ethers.constants.Zero);
    });

    it("Should not flush ETH balance", async function () {
      const { TokenMaker } = await loadFixture(deployContractsFixture);

      await expect(TokenMaker.flushETH()).to.revertedWith(
        "TokenFactory: zero ether balance"
      );
    });
  });
});
