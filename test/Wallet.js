const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Wallet", function () {
  let owner, feeRecipient, user1, user2, wallet;
  let ERC20Token, ERC721Token;
  let erc20Token, erc721Token;
  const feePercent = 1;

  beforeEach(async function () {
    // Деплоим контракты ERC20Token и ERC721Token для тестирования
    ERC20Token = await ethers.getContractFactory("ERC20Token");
    erc20Token = await ERC20Token.deploy();
    await erc20Token.deployed();

    ERC721Token = await ethers.getContractFactory("ERC721Token");
    erc721Token = await ERC721Token.deploy();
    await erc721Token.deployed();

    // Деплоим контракт Wallet
    const Wallet = await ethers.getContractFactory("Wallet");
    [owner, feeRecipient, user1, user2] = await ethers.getSigners();
    wallet = await Wallet.deploy(feeRecipient.address, feePercent);
    await wallet.deployed();
  });

  // Тесты для метода setFeePercent
  describe("setFeePercent", function () {
    it("should set the fee percent", async function () {
      const newFeePercent = 2;
      await wallet.setFeePercent(newFeePercent);
      const result = await wallet.feePercent();
      expect(result).to.equal(newFeePercent);
    });

    it("should revert if called by non-owner", async function () {
      await expect(wallet.connect(user1).setFeePercent(2)).to.be.revertedWith("Only owner can use this wallet");
    });

    it("should revert if fee percent is greater than 100", async function () {
      await expect(wallet.setFeePercent(101)).to.be.revertedWith("Fee precent should be less than 100%");
    });
  });

  // Тесты для метода sendEth
  describe("sendEth", function () {
    it("should send ETH and deduct fee", async function () {
      const initialBalance = await ethers.provider.getBalance(user1.address);
      const amountToSend = ethers.utils.parseEther("1");
      const feeAmount = amountToSend.mul(feePercent).div(100);
      const expectedAmountAfterFee = amountToSend.sub(feeAmount);

      await wallet.sendEth(user1.address, { value: amountToSend });
      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance.sub(initialBalance)).to.equal(expectedAmountAfterFee);
    });

    it("should revert if amount is 0", async function () {
      await expect(wallet.sendEth(user1.address, { value: 0 })).to.be.revertedWith("Amount should be greater than 0");
    });

    it("should revert if not enough ETH in wallet", async function () {
      const amountToSend = ethers.utils.parseEther("1");
      await expect(wallet.sendEth(user1.address, { value: amountToSend })).to.be.revertedWith("Not enough eth");
    });
  });

  // Тесты для метода sendERC20
  describe("sendERC20", function () {
    it("should send ERC20 tokens and deduct fee", async function () {
      const amountToSend = ethers.utils.parseUnits("100", "ether");
      const feeAmount = amountToSend.mul(feePercent).div(100);
	  const expectedAmountAfterFee = amountToSend.sub(feeAmount);
	  await erc20Token.transfer(wallet.address, amountToSend);
	  await wallet.sendERC20(erc20Token.address, user1.address, amountToSend);
	  const user1Balance = await erc20Token.balanceOf(user1.address);
	  expect(user1Balance).to.equal(expectedAmountAfterFee);
	});

	it("should revert if amount is 0", async function () {
	  await expect(wallet.sendERC20(erc20Token.address, user1.address, 0)).to.be.revertedWith("Amount should be greater than 0");
	});

	it("should revert if not enough ERC20 tokens in wallet", async function () {
	  const amountToSend = ethers.utils.parseUnits("100", "ether");
	  await expect(wallet.sendERC20(erc20Token.address, user1.address, amountToSend)).to.be.revertedWith("Not enough tokens");
	});
});

// Тесты для метода sendERC721
describe("sendERC721", function () {
	it("should send ERC721 token and deduct fee", async function () {
	await erc721Token.mint(wallet.address, 1);
	await wallet.sendERC721(erc721Token.address, user1.address, 1);
	const user1Balance = await erc721Token.balanceOf(user1.address);
	expect(user1Balance).to.equal(1);
});
	it("should revert if tokenId does not exist", async function () {
	await expect(wallet.sendERC721(erc721Token.address, user1.address, 2)).to.be.revertedWith("Token does not exist");
});

  it("should revert if not enough ERC721 tokens in wallet", async function () {
  await erc721Token.mint(wallet.address, 1);
  await expect(wallet.sendERC721(erc721Token.address, user1.address, 2)).to.be.revertedWith("Not enough tokens");
		});
	});

});