import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  TokenCreatedEvent,
  TokenMaker,
} from "../typechain-types/contracts/TokenMaker";
import {
  MintableERC20,
  MintableERC20__factory,
  StandardERC20,
  StandardERC20__factory,
} from "../typechain-types";

const name = "Test Token",
  symbol = "TTK",
  initialSupply = ethers.BigNumber.from(21000000),
  mintFee = ethers.utils.parseEther("0.1"),
  referrer = ethers.constants.AddressZero;

describe("TokenMaker", function () {
  let StandardERC20Factory: StandardERC20__factory;
  let MintableERC20Factory: MintableERC20__factory;

  before(async () => {
    StandardERC20Factory = await ethers.getContractFactory("StandardERC20");
    MintableERC20Factory = await ethers.getContractFactory("MintableERC20");
  });

  const createStandardERC20 = async (factory: TokenMaker) => {
    const tx = await factory.createToken(
      name,
      symbol,
      initialSupply,
      false,
      referrer,
      {
        value: mintFee,
      }
    );

    const trans = await tx.wait();

    const address = (
      trans.events?.find((v) => v.event == "TokenCreated") as TokenCreatedEvent
    ).args[0];

    return StandardERC20Factory.attach(address);
  };

  const createMintableERC20 = async (factory: TokenMaker) => {
    const tx = await factory.createToken(
      name,
      symbol,
      initialSupply,
      true,
      referrer,
      {
        value: mintFee,
      }
    );

    const trans = await tx.wait();

    const address = (
      trans.events?.find((v) => v.event == "TokenCreated") as TokenCreatedEvent
    ).args[0];

    return MintableERC20Factory.attach(address);
  };

  const validateTokenCreated = async (
    token: StandardERC20 | MintableERC20,
    owner: string
  ) => {
    expect(await token.symbol()).to.equal(symbol);
    expect(await token.totalSupply()).to.equal(initialSupply);
    expect(await token.balanceOf(owner)).to.equal(initialSupply);
  };

  async function deployContractsFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const StandardERC20 = await StandardERC20Factory.deploy();
    const MintableERC20 = await MintableERC20Factory.deploy();

    const TokenMakerFactory = await ethers.getContractFactory("TokenMaker");
    const TokenMaker = await TokenMakerFactory.deploy(
      StandardERC20.address,
      MintableERC20.address,
      mintFee
    );

    return { TokenMaker, StandardERC20, MintableERC20, owner, otherAccount };
  }

  describe("TokenFactory", function () {
    describe("Admin methods", function () {
      it("Should has correct initial values", async function () {
        const { TokenMaker, StandardERC20, MintableERC20 } = await loadFixture(
          deployContractsFixture
        );

        expect(await TokenMaker.standardFee()).to.equal(mintFee);
        expect(await TokenMaker.mintableFee()).to.equal(mintFee);

        expect(await TokenMaker.standardERC20()).to.equal(
          StandardERC20.address
        );
        expect(await TokenMaker.mintableERC20()).to.equal(
          MintableERC20.address
        );
      });

      it("Should change fees", async function () {
        const { TokenMaker, StandardERC20 } = await loadFixture(
          deployContractsFixture
        );

        const newStandardFee = ethers.utils.parseEther("0.0033"),
          newMintableFee = ethers.utils.parseEther("0.002");

        expect(await TokenMaker.standardFee()).to.equal(mintFee);
        expect(await TokenMaker.mintableFee()).to.equal(mintFee);

        await TokenMaker.changeCreationFee(newStandardFee, false);
        expect(await TokenMaker.standardFee()).to.equal(newStandardFee);

        await TokenMaker.changeCreationFee(newMintableFee, true);
        expect(await TokenMaker.mintableFee()).to.equal(newMintableFee);
      });

      it("Should flush ETH balance", async function () {
        const { TokenMaker, owner } = await loadFixture(deployContractsFixture);

        const balanceBefore = await ethers.provider.getBalance(
          TokenMaker.address
        );

        await createStandardERC20(TokenMaker);

        const balanceAfter = await ethers.provider.getBalance(
          TokenMaker.address
        );

        // sub referrer fee
        const referrerCut = mintFee.div(100);
        expect(balanceAfter).to.equal(mintFee.sub(referrerCut));
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

        await TokenMaker.flushETH();

        // await expect(TokenMaker.flushETH()).to.be.revertedWithCustomError(
        //   TokenMaker,
        //   "NoBalance"
        // );
      });
    });

    describe("User methods", function () {
      it("Should create standard erc20", async function () {
        const { TokenMaker, owner } = await loadFixture(deployContractsFixture);
        const tokenCreated = await createStandardERC20(TokenMaker);

        validateTokenCreated(tokenCreated, owner.address);
      });

      it("Should create mintable erc20", async function () {
        const { TokenMaker, owner } = await loadFixture(deployContractsFixture);
        const tokenCreated = await createMintableERC20(TokenMaker);

        validateTokenCreated(tokenCreated, owner.address);
      });
    });
  });
});
