import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const name = "Test Token",
  symbol = "TTK",
  decimals = 18,
  initialSupply = 21000000,
  mintFee = ethers.constants.WeiPerEther.div(10);

describe("TokenMaker", function () {

    const createToken = async () => {
        const tx = await factory.newBasicToken(
          name,
          symbol,
          decimals,
          initialSupply,
          {
            value: (1e16).toString(),
          }
        );
    
        const address = tx.logs[0].args[0];
    
        return BasicToken.at(address);
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
      const { lock, unlockTime } = await loadFixture(deployContractsFixture);

      expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    it("Should flush ETH balance", async function () {
      const { lock, owner } = await loadFixture(deployContractsFixture);

      expect(await lock.owner()).to.equal(owner.address);
    });

    it("Should not flush ETH balance", async function () {
      const { lock, lockedAmount } = await loadFixture(deployContractsFixture);

      expect(await ethers.provider.getBalance(lock.address)).to.equal(
        lockedAmount
      );
    });

    
  });

  
});
