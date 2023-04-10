require("@nomicfoundation/hardhat-toolbox");

// Go to https://infura.io, sign up, create a new API key
// in its dashboard, and replace "KEY" with it
const INFURA_API_KEY = "ad734e6063de409aa619e3ace9adaf94";

// Replace this private key with your Sepolia account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const SEPOLIA_PRIVATE_KEY = "54c1496eddb847003222ae97f63f5764447ce272dc882447a7794e54f00c0483";
const MAINNET_PRIVATE_KEY = "54c1496eddb847003222ae97f63f5764447ce272dc882447a7794e54f00c0483";


//import('hardhat/config.js').HardhatUserConfig;
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
    },
    localhost: {
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [MAINNET_PRIVATE_KEY]
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
