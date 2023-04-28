import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    dashboard: {
      url: "http://localhost:24012/rpc",
      gasPrice: 50000000000
    },
  },
};

export default config;
