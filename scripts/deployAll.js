const { ethers, upgrades } = require("hardhat");

async function main() {
    const adminAddress = process.env.ADMIN_ADDRESS;
    console.log("Deploying contracts with admin address:", adminAddress);

    // Kiểm tra địa chỉ hợp lệ vì không dùng đc hàm isAddress() nên a dùng bừa
    if (!/^0x[a-fA-F0-9]{40}$/.test(adminAddress)) {
        throw new Error("Invalid admin address format");
    }

    // Deploy WhitelistUpgradeableV2
    console.log("Deploying WhitelistUpgradeableV2...");
    const Whitelist = await ethers.getContractFactory("WhitelistUpgradeableV2");
    const whitelist = await upgrades.deployProxy(Whitelist, [adminAddress], { initializer: "initialize" });
    await whitelist.waitForDeployment();
    const whitelistAddress = await whitelist.getAddress();
    console.log("WhitelistUpgradeableV2 deployed to:", whitelistAddress);

    // Deploy SeminarNFT
    console.log("Deploying SeminarNFT...");
    const SeminarNFT = await ethers.getContractFactory("SeminarNFT");
    const seminarNFT = await upgrades.deployProxy(SeminarNFT, [adminAddress, whitelist.target], { initializer: "initialize" });
    await seminarNFT.waitForDeployment();
    const seminarNFTAddress = await seminarNFT.getAddress();
    console.log("SeminarNFT deployed to:", seminarNFTAddress);

    // Deploy Voting
    console.log("Deploying Voting...");
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await upgrades.deployProxy(
        Voting,
        [adminAddress, seminarNFTAddress, whitelistAddress],
        { initializer: "initialize" }
    );
    await voting.waitForDeployment();
    const votingAddress = await voting.getAddress();
    console.log("Voting deployed to:", votingAddress);

    // Log các địa chỉ
    console.log("Deploying CertificationSBT...");
    const contractName = "CertificationSBT";
    const contractSymbol = "CSBT";
    const baseURI = "http/";
    const CertificationSBT = await ethers.getContractFactory("CertificationSBT");
    const certificationSBT = await CertificationSBT.deploy (contractName, contractSymbol, baseURI, whitelistAddress);
    await certificationSBT.waitForDeployment();
    const cSBTAddress = await certificationSBT.getAddress();
    console.log("CertificationSBT deployed to:", cSBTAddress);


    console.log("\nAll contracts deployed successfully:");
    console.log("WhitelistUpgradeableV2:", whitelistAddress);
    console.log("SeminarNFT:", seminarNFTAddress);
    console.log("Voting:", votingAddress);
    console.log("SBT:", cSBTAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contracts:", error);
        process.exit(1);
    });