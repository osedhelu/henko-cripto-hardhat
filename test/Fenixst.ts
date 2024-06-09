import { ethers } from "hardhat";
import { expect } from "chai";

describe("Contrato Fenixst", function () {
  async function deployFenixstFixture() {
    const [deployer, pauser, otherAccount] = await ethers.getSigners();
    const FENIXST = await ethers.getContractFactory("Fenixst");
    const fenixst = await FENIXST.deploy(deployer.address, pauser.address);
    return { fenixst, addressToken: await fenixst.getAddress(), deployer, pauser, otherAccount };
  }
  it("", async function () {
    const { fenixst, addressToken, deployer, pauser, otherAccount } = await deployFenixstFixture();
    describe("Despliegue", function () {
      describe("Debe establecer el administrador y el pauser correctos", function () {
        it("Debe tener el rol de pauser", async function () {
          // ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE")), pauser.address
          const hasPauserRole = await fenixst.getWalletRole(ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE")), pauser.address);
          expect(hasPauserRole).to.equal(true);
        })
        it("Debe tener el rol de admin", async function () {
          const hasAdminRole = await fenixst.getWalletRole(ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")), deployer.address);
          expect(hasAdminRole).to.equal(true);
        })
      });

      it("Debe acuñar tokens iniciales al desplegador", async function () {
        const balance = await fenixst.balanceOf(deployer.address);
        expect(balance).to.equal(ethers.parseUnits("10000000000", await fenixst.decimals()));
      });
    });

    describe("Pausabilidad", function () {
      it("Debe pausar y emitir un evento", async function () {
        await expect(fenixst.connect(pauser).pause())
          .to.emit(fenixst, "Paused")
          .withArgs(pauser.address);
      });

      it("debe rechazar transferencias mientras este pausado", async function () {
        await expect(fenixst.transfer(otherAccount.address, 1000)).to.be.revertedWithCustomError(fenixst, "EnforcedPause");
      });

      it("Debe reanudar y permitir transferencias", async function () {
        await fenixst.connect(pauser).unpause();
        await expect(fenixst.transfer(otherAccount.address, 1000))
          .to.emit(fenixst, "Transfer")
          .withArgs(deployer.address, otherAccount.address, 1000);
      });
    });

    describe("Gestión de Roles", function () {
      it("Debe permitir que el administrador otorgue roles", async function () {
        await expect(fenixst.connect(deployer).grantRole(ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE")), otherAccount.address))
          .to.emit(fenixst, "RoleGranted")
          .withArgs(ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE")), otherAccount.address, deployer.address);
      });
    });

    describe("Recuperación de Tokens", function () {
      it("Debe permitir que el administrador recupere tokens ERC20 enviados por error", async function () {
        const dummyERC20 = await ethers.getContractFactory("Fenixst");
        const dummyToken = await dummyERC20.deploy(deployer.address, otherAccount.address);
        await dummyToken.connect(deployer).transfer(addressToken, 1000);

        await expect(fenixst.connect(deployer).withdrawFreezeToken(dummyToken as any, deployer.address)).to.emit(dummyToken, "Transfer")
          .withArgs(addressToken, deployer.address, 1000);
        const balanceAfter = await dummyToken.balanceOf(deployer.address);
        expect(balanceAfter).to.be.greaterThanOrEqual(1000);
      });

      it("Debe permitir que el administrador recupere Ether enviado por error", async function () {
        const initialBalance = await deployer.provider.getBalance(deployer.address) as bigint;

        // await deployer.sendTransaction();
        const ienitialBalance = await deployer.provider.getBalance(deployer.address) as bigint;
        console.log({
          to: addressToken,
          value: ethers.parseEther("1")
        })
        console.log(ienitialBalance)
        expect(false).to.be.true
        // await deployer.sendTransaction({
        //   to: addressToken,
        //   value: ethers.parseEther("1")
        // });

        // const tx = await fenixst.connect(deployer).withdrawFreezeBNB(deployer.address);
        // const receipt = await tx.wait();

        // const gasUsed = receipt?.gasPrice! * receipt?.gasUsed!;

        // const finalBalance = await deployer.provider.getBalance(deployer.address) as bigint;
        // const adjustedBalance = finalBalance - gasUsed;

        // expect(adjustedBalance).to.be.closeTo(
        //   initialBalance + ethers.parseEther("1"), ethers.parseEther("0.01")
        // );
      });
    });
  })

});
