// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract FenixNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Pausable,
    Ownable,
    ERC721Burnable
{
    uint256 private _nextTokenId;
    IERC20 public paymentToken; // Variable para almacenar el contrato del token ERC20
    uint256 public constant PRICE = 30 * 10 ** 18; // Precio en tokens ERC20 (asumiendo 18 decimales)

    // Constructor del contrato, establece el nombre y símbolo del token,
    // y asigna la propiedad inicial al owner especificado.
    constructor(
        address initialOwner,
        IERC20 _paymentToken
    ) ERC721("FenixNFT", "FTK") Ownable(initialOwner) {
        paymentToken = _paymentToken; // Asigna el contrato del token de pago
    }

    // Función para pausar todas las transferencias de tokens.
    // Solo puede ser llamada por el owner.
    function pause() public onlyOwner {
        _pause();
    }

    // Función para reanudar todas las transferencias de tokens.
    // Solo puede ser llamada por el owner.
    function unpause() public onlyOwner {
        _unpause();
    }
    // Función para acuñar (crear) nuevos tokens.
    // Requiere el pago de 30 tokens ERC20 y transfiere los tokens al contrato.
    function xsafeMint(address to, string memory uri) public {
        require(
            paymentToken.transferFrom(msg.sender, address(this), PRICE),
            "Payment failed"
        );
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Función para acuñar (crear) nuevos tokens.
    // Solo puede ser llamada por el owner.
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    // Función para retirar todos los tokens ERC20 acumulados en el contrato.
    // Solo puede ser llamada por el owner.
    function withdrawERC20() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(paymentToken.transfer(owner(), balance), "Transfer failed");
    }

    // Las siguientes funciones son sobrescrituras requeridas por Solidity.

    // Función interna para actualizar el estado del token.
    // Sobrescribe métodos de ERC721, ERC721Enumerable, y ERC721Pausable.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    

    // Función interna para incrementar el balance de tokens de una cuenta.
    // Sobrescribe métodos de ERC721 y ERC721Enumerable.
    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    // Función para obtener la URI del token, que contiene sus metadatos.
    // Sobrescribe métodos de ERC721 y ERC721URIStorage.
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Función para verificar si el contrato soporta una interfaz específica.
    // Sobrescribe métodos de ERC721, ERC721Enumerable, y ERC721URIStorage.
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
