import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    dashboard: {
      url: "http://localhost:24012/rpc",
      gasPrice: 20000000000,
    },
  },
  etherscan: {
    apiKey: {
      ethereum: "NFRA5IUKX9P837S9UUFHBVGIBW8PC3UFFN",
      celo: "3UG79VPKJE9D4XJSFYGTGC8IPR5PU5YFPH",
      alfajores: "3UG79VPKJE9D4XJSFYGTGC8IPR5PU5YFPH",
      bsctest: "1WB1S78ENEHYH3PKHYWMH4YES9B9113W8H",
      bsc: "1WB1S78ENEHYH3PKHYWMH4YES9B9113W8H"
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.ioc/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io/",
        },
      },
      {
        network: "bsctest",
        chainId: 97,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com/",
        },
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com/",
        },
      },
      {
        network: "lineatest",
        chainId: 59140,
        urls: {
          apiURL: "",
          browserURL: "",
        },
      },
    ],
  },
};

export default config;
