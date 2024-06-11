import { ethers } from "hardhat";
import { expect } from "chai";

describe("Contrato FTS Collectibles", function () {
    async function deployFenixstFixture() {
        const [deployer, pauser, otherAccount] = await ethers.getSigners();
        const FENIXST = await ethers.getContractFactory("Fenixst");
        const fenixst = await FENIXST.deploy(deployer.address, pauser.address);
        return { fenixst, addressToken: await fenixst.getAddress(), deployer, pauser, otherAccount };
    }
    async function deployMyTokenFixture() {
        const { fenixst, addressToken, deployer, pauser, otherAccount } = await deployFenixstFixture();
        const Token = await ethers.getContractFactory("FenixNFT");
        const TokenNFT = await Token.deploy(deployer.address, addressToken);
        return { TokenNFT, fenixst, deployer, pauser, otherAccount };
    }

    it("", async function () {
        const { TokenNFT, deployer, fenixst, otherAccount, pauser } = await deployMyTokenFixture();
        describe("Despliegue", function () {
            it("Debe desplegar el contrato correctamente", async function () {
                expect(await TokenNFT.owner()).to.equal(deployer.address);
            })
        })

        describe("Pausabilidad", function () {
            it("Debe pausar y emitir un evento", async function () {
                await expect(TokenNFT.pause()).to.emit(TokenNFT, "Paused").withArgs(deployer.address);
            });

            it("Debe rechazar transferencias mientras esté pausado", async function () {
                await expect(await TokenNFT.transferFrom(deployer.address, otherAccount.address, 1)).to.be.revertedWithCustomError(TokenNFT, "EnforcedPause");
            });

            it("Debe reanudar y permitir transferencias", async function () {
                await TokenNFT.pause();
                await TokenNFT.unpause();
                await expect(TokenNFT.transferFrom(deployer.address, otherAccount.address, 1)).to.be.revertedWith("ERC721: caller is not token owner nor approved");
            });
        });

        describe("Funcionalidad de acuñación", function () {
            it("Debe acuñar un nuevo token al owner sin pago de ERC20", async function () {
                await TokenNFT.safeMint(deployer.address, "ipfs://test-uri");
                expect(await TokenNFT.tokenURI(0)).to.equal("ipfs://test-uri");
            });

            it("Debe acuñar un nuevo token con pago de ERC20", async function () {
                await fenixst.transfer(otherAccount.address, ethers.parseUnits("100", 18));
                await fenixst.connect(otherAccount).approve(await TokenNFT.getAddress(), ethers.parseUnits("30", 18));
                await TokenNFT.connect(otherAccount).xsafeMint(otherAccount.address, "ipfs://test-uri-2");
                expect(await TokenNFT.tokenURI(0)).to.equal("ipfs://test-uri-2");
            });
        });

        describe("Gestión de Roles", function () {
            it("Debe permitir que el administrador otorgue roles", async function () {
                await expect(fenixst.connect(deployer).grantRole(ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")), otherAccount.address))
                    .to.emit(TokenNFT, "RoleGranted")
                    .withArgs(ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")), otherAccount.address, deployer.address);
            });
        });

        describe("Recuperación de Tokens ERC20", function () {
            it("Debe permitir que el administrador recupere tokens ERC20 enviados por error", async function () {
                await fenixst.transfer(await TokenNFT.getAddress(), ethers.parseUnits("100", 18));
                await expect(TokenNFT.connect(deployer).withdrawERC20()).to.emit(fenixst, "Transfer")
                    .withArgs(await TokenNFT.getAddress(), deployer.address, ethers.parseUnits("100", 18));
                const balanceAfter = await fenixst.balanceOf(deployer.address);
                expect(balanceAfter).to.be.gte(ethers.parseUnits("100", 18));
            });
        });
    });
});



