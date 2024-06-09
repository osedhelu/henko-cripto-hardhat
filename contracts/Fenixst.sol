// SPDX-License-Identifier: MIT
// Compatible con OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol";

/// @custom:security-contact osedhelu@gmail.com
contract Fenixst is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit,
    ERC20Votes,
    ERC20FlashMint
{
    string private _tokenImageIPFS;

    // Definir el rol de pausador del contrato
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Mapping para almacenar los roles
    mapping(bytes32 => mapping(address => bool)) private _roles;

    // Constructor del contrato
    constructor(
        address defaultAdmin, // Dirección del administrador por defecto
        address pauser // Dirección que tendrá el rol de pausar el contrato
    ) ERC20("FENIXST", "FST") ERC20Permit("FENIXST") {
        _roles[DEFAULT_ADMIN_ROLE][msg.sender] = true;
        _roles[PAUSER_ROLE][pauser] = true;
        _roles[ADMIN_ROLE][defaultAdmin] = true;
        _grantRole(ADMIN_ROLE, defaultAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, pauser);
        // Emite una cantidad inicial de tokens
        _mint(msg.sender, 10000000000 * 10 ** decimals());
    }
 // Establecer la URL IPFS para la imagen del token
    function setTokenImageIPFS(string memory newUrl) public onlyRole(ADMIN_ROLE) {
        _tokenImageIPFS = newUrl;
    }

    // Obtener la URL IPFS de la imagen del token
    function getTokenImageIPFS() public view returns (string memory) {
        return _tokenImageIPFS;
    }

    // Función para pausar todas las transacciones del token
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    // Función para reanudar las transacciones del token
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    // Funciones sobrescritas de Solidity para integrar múltiples herencias
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable, ERC20Votes) {
        super._update(from, to, value);
    }

    // Función para obtener los nonces de los permisos de operación
    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    // Función para recuperar tokens ERC20 enviados por error al contrato
    function withdrawFreezeToken(
        IERC20 erctoken,
        address wallet
    ) public onlyRole(ADMIN_ROLE) {
        erctoken.transfer(wallet, erctoken.balanceOf(address(this)));
    }

    // Función para recuperar BNB enviados por error al contrato
    function withdrawFreezeBNB(
        address payable wallet
    ) public onlyRole(ADMIN_ROLE) {
        uint256 weiAmount = address(this).balance;
        wallet.transfer(weiAmount);
    }
    function getWalletRole(
        bytes32 role,
        address wallet
    ) public view returns (bool) {
        return _roles[role][wallet];
    }
    function setNewRole(
        bytes32 role,
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _roles[role][account] = true;
        _grantRole(role, account);
    }
}
