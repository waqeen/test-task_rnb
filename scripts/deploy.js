// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const feeRecipient = "  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" // нужный адрес
  const feePercent = 1 // начальная комиссия

  const Wallet = await hre.ethers.getContractFactory("Wallet")
  const wallet = await Wallet.deploy(feeRecipient, feePercent)
  await wallet.deployed()


  console.log(`Deployed Wallet Contract at: ${wallet.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
