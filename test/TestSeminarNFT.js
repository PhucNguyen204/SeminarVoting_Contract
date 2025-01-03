const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { ERROR_PREFIX } = require("hardhat/internal/core/errors-list");

describe("SeminarNFT", function () {
    let seminarNFT, owner, admin, other, speaker;

    beforeEach(async function () {
        [owner, admin, other, speaker] = await ethers.getSigners();

        const SeminarNFTFactory = await ethers.getContractFactory("SeminarNFT");
        seminarNFT = await upgrades.deployProxy(SeminarNFTFactory, [owner.address], { initializer: "initialize" });
    });

    it("Check quyền admin của owner, admin, other, speaker", async function () {
        const ADMIN_ROLE = await seminarNFT.ADMIN_ROLE();
        expect(await seminarNFT.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
        expect(await seminarNFT.hasRole(ADMIN_ROLE, admin.address)).to.equal(false);
        expect(await seminarNFT.hasRole(ADMIN_ROLE, other.address)).to.equal(false);
        expect(await seminarNFT.hasRole(ADMIN_ROLE, speaker.address)).to.equal(false);
    });

    async function mintNewSeminar() {
        const _name = "FzH";
        const _description = "Fauz Handsome";
        const _image = "Fauz's image";
        const _nameSpeaker = "Fauz";
        const _metadataURI = "hehehehe";
        const _speaker = [speaker.address, other.address];

        await expect(
            seminarNFT.connect(owner).mintSeminar(
            _name, 
            _description, 
            _image, 
            _nameSpeaker, 
            _metadataURI, 
            _speaker
            )
        ).to.emit(seminarNFT, "SeminarMinted")
        .withArgs(1, owner.address, _name, _metadataURI, _speaker);
    }

    it("Test mint", async function () {
        const ADMIN_ROLE = await seminarNFT.ADMIN_ROLE();
        expect(await seminarNFT.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
        mintNewSeminar();
    });

    it("Test get", async function () {
        await mintNewSeminar();

        // check test get seminar
        const data = await seminarNFT.getSeminar(1);
        expect(data[0]).to.equal("FzH");
        expect(data[1]).to.equal("Fauz Handsome");
        expect(data[2]).to.equal("Fauz's image");
        expect(data[3]).to.equal("Fauz");
        expect(data[4]).to.equal("hehehehe");
        expect(data[5][0]).to.equal(speaker.address);
        expect(data[5][1]).to.equal(other.address);
        
        // check test get speakers
        const speakers = await seminarNFT.getSeminarSpeakers(1);
        expect(data[5][0]).to.equal(speakers[0]);
        expect(data[5][1]).to.equal(speakers[1]);
    });

    it("Test update", async function () {
        await mintNewSeminar();
        await expect(
            seminarNFT.connect(owner).updateMetadata(1, "new data")
        ).to.emit(seminarNFT, "MetadataUpdated")
        .withArgs(1, "new data");

        const data = await seminarNFT.getSeminar(1);

        expect(data[4]).to.equal("new data");
    });

    it("Non-admin không thể mint seminarNFT", async function () {
        await expect(
            seminarNFT.connect(other).mintSeminar(
                "Seminar",
                "fail",
                "image",
                "other",
                "metadata",
                [other.address]
            )
        ).to.be.reverted;
    });

    it("Non-admin không thể update data", async function () {
        await mintNewSeminar();
        await expect(
            seminarNFT.connect(other).updateMetadata(1, "new data")
        ).to.be.reverted;
    });

});