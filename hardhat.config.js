require("@nomicfoundation/hardhat-toolbox"); // này nó thêm cả ethers và upgrades vào nên a ko cần require nữa
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

module.exports = {
    solidity: "0.8.20",
    networks: {
        bsctestnet: { //mạng bsc: npx hardhat run scripts/deployAll.js --network bsctestnet
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: [`0x${process.env.PRIVATE_KEY}`],
        },
    
        hardhat: {
            chainId: 1337, 
        },
        localhost: { //chạy localhost : npx hardhat node npx hardhat run scripts/deployAll.js --network localhost
            url: "http://127.0.0.1:8545",
            chainId: 1337, 
        },
    },
};
