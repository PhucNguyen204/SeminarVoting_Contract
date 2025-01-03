const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificationSBT Contract", function () {
    let CertificationSBT, sbt;
    let owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const CertificationSBTFactory = await ethers.getContractFactory("CertificationSBT");
        sbt = await CertificationSBTFactory.deploy("Certification", "SBT", "https://example.com/metadata/");
        await sbt.waitForDeployment();
    });

    it("Set đúng tên, ký hiệu viết tắt, base URI", async function () {
        expect(await sbt.name()).to.equal("Certification");
        expect(await sbt.symbol()).to.equal("SBT");
        await sbt.setBaseURI("https://newbase.com/metadata/");
        expect(await sbt.uri(0)).to.equal("https://newbase.com/metadata/0");
    });

    it("Tạo một new Soul token", async function () {
        const soulName = "Seminar Certificate";
        const description = "A certificate for attending the seminar.";
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = 0;
        const metadataURI = "https://example.com/soul/0";

        await expect(sbt.createSoul(soulName, description, startDate, endDate, metadataURI))
            .to.emit(sbt, "CreatedSoul")
            .withArgs(owner.address, 0, soulName);

        const soul = await sbt.soulIdToSoulContainer(0);
        expect(soul.soulName).to.equal(soulName);
        expect(soul.description).to.equal(description);
        expect(soul.registeredTimestamp).to.be.gt(0);
        expect(soul.startDateTimestamp).to.equal(startDate);
        expect(soul.endDateTimestamp).to.equal(endDate);
        expect(soul.metadataURI).to.equal(metadataURI);
    });

    it("Ngăn không mint ra 1 Soul ko tồn tại", async function () {
        const soulName = "Seminar Certificate";
        const description = "A certificate for attending the seminar.";
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = 0;
        const metadataURI = "https://example.com/soul/0";

        await sbt.createSoul(soulName, description, startDate, endDate, metadataURI);

        await expect(sbt.mint(user1.address, 0))
            .to.emit(sbt, "SoulMinted")
            .withArgs(user1.address, 0);

        expect(await sbt.balanceOf(user1.address, 0)).to.equal(1);
    });

    it("Should prevent minting a non-existent Soul", async function () {
        await expect(sbt.mint(user1.address, 0)).to.be.revertedWith("SoulId is not created yet");
    });

    it("Ngăn không cho mint token trước start date", async function () {
        const startDate = Math.floor(Date.now() / 1000) + 3600;
        const metadataURI = "https://example.com/soul/0";

        await sbt.createSoul("Future Certificate", "Not yet active", startDate, 0, metadataURI);

        await expect(sbt.mint(user1.address, 0)).to.be.revertedWith("Mint has not started");
    });

    it("Ngăn không cho mint token sau end date", async function () {
        const startDate = Math.floor(Date.now() / 1000) - 3600;
        const endDate = Math.floor(Date.now() / 1000) - 1800;
        const metadataURI = "https://example.com/soul/0";

        await sbt.createSoul("Expired Certificate", "Already ended", startDate, endDate, metadataURI);

        await expect(sbt.mint(user1.address, 0)).to.be.revertedWith("Mint has ended");
    });

    it("Ngăn không cho chuyển Soulbound token", async function () {
        const soulName = "Non-Transferable Certificate";
        const description = "Cannot be transferred.";
        const startDate = Math.floor(Date.now() / 1000);
        const metadataURI = "https://example.com/soul/0";

        await sbt.createSoul(soulName, description, startDate, 0, metadataURI);
        await sbt.mint(user1.address, 0);

        await expect(sbt.safeTransferFrom(user1.address, user2.address, 0, 1, "0x"))
            .to.be.revertedWith("Soulbound Token: transfer not allowed");

        await expect(sbt.safeBatchTransferFrom(user1.address, user2.address, [0], [1], "0x"))
            .to.be.revertedWith("Soulbound Token: batch transfer not allowed");
    });
});