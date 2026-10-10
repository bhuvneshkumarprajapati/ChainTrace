// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProductVerification {
    struct Product {
        string productId;
        string productHash;
        address manufacturer;
        address currentOwner;
        bool exists;
        uint256 registeredAt;
    }

    struct SupplyChainEvent {
        string eventType;
        address from;
        address to;
        string location;
        string description;
        string transactionReference;
        uint256 timestamp;
    }

    mapping(string => Product) private products;

    mapping(string => SupplyChainEvent[]) private productHistory;

    event ProductRegistered(
        string indexed productId,
        address indexed manufacturer,
        string productHash,
        uint256 timestamp
    );

    event ProductTransferred(
        string indexed productId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event SupplyChainEventAdded(
        string indexed productId,
        string eventType,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    // =========================
    // REGISTER PRODUCT
    // =========================
    function registerProduct(
        string memory _productId,
        string memory _productHash
    ) external {
        require(
            !products[_productId].exists,
            "Product already registered"
        );

        products[_productId] = Product({
            productId: _productId,
            productHash: _productHash,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            exists: true,
            registeredAt: block.timestamp
        });

        productHistory[_productId].push(
            SupplyChainEvent({
                eventType: "MANUFACTURED",
                from: address(0),
                to: msg.sender,
                location: "",
                description: "Product registered on blockchain",
                transactionReference: "",
                timestamp: block.timestamp
            })
        );

        emit ProductRegistered(
            _productId,
            msg.sender,
            _productHash,
            block.timestamp
        );
    }

    // =========================
    // TRANSFER PRODUCT
    // =========================
    function transferProduct(
        string memory _productId,
        address _newOwner,
        string memory _location,
        string memory _description
    ) external {
        require(
            products[_productId].exists,
            "Product does not exist"
        );

        require(
            products[_productId].currentOwner == msg.sender,
            "Only current owner can transfer"
        );

        require(
            _newOwner != address(0),
            "Invalid new owner"
        );

        address previousOwner =
            products[_productId].currentOwner;

        products[_productId].currentOwner = _newOwner;

        productHistory[_productId].push(
            SupplyChainEvent({
                eventType: "TRANSFERRED",
                from: previousOwner,
                to: _newOwner,
                location: _location,
                description: _description,
                transactionReference: "",
                timestamp: block.timestamp
            })
        );

        emit ProductTransferred(
            _productId,
            previousOwner,
            _newOwner,
            block.timestamp
        );
    }

    // =========================
    // ADD SUPPLY CHAIN EVENT
    // =========================
    function addSupplyChainEvent(
        string memory _productId,
        string memory _eventType,
        address _to,
        string memory _location,
        string memory _description,
        string memory _transactionReference
    ) external {
        require(
            products[_productId].exists,
            "Product does not exist"
        );

        productHistory[_productId].push(
            SupplyChainEvent({
                eventType: _eventType,
                from: msg.sender,
                to: _to,
                location: _location,
                description: _description,
                transactionReference: _transactionReference,
                timestamp: block.timestamp
            })
        );

        emit SupplyChainEventAdded(
            _productId,
            _eventType,
            msg.sender,
            _to,
            block.timestamp
        );
    }

    // =========================
    // VERIFY PRODUCT
    // =========================
    function verifyProduct(
        string memory _productId,
        string memory _productHash
    )
        external
        view
        returns (
            bool valid,
            address manufacturer,
            address currentOwner
        )
    {
        Product memory product = products[_productId];

        if (!product.exists) {
            return (
                false,
                address(0),
                address(0)
            );
        }

        bool hashMatches =
            keccak256(bytes(product.productHash)) ==
            keccak256(bytes(_productHash));

        return (
            hashMatches,
            product.manufacturer,
            product.currentOwner
        );
    }

    // =========================
    // GET PRODUCT
    // =========================
    function getProduct(
        string memory _productId
    )
        external
        view
        returns (
            string memory productId,
            string memory productHash,
            address manufacturer,
            address currentOwner,
            bool exists,
            uint256 registeredAt
        )
    {
        Product memory product = products[_productId];

        return (
            product.productId,
            product.productHash,
            product.manufacturer,
            product.currentOwner,
            product.exists,
            product.registeredAt
        );
    }

    // =========================
    // GET PRODUCT HISTORY
    // =========================
    function getProductHistory(
        string memory _productId
    )
        external
        view
        returns (SupplyChainEvent[] memory)
    {
        return productHistory[_productId];
    }

    // =========================
    // CHECK PRODUCT EXISTS
    // =========================
    function productExists(
        string memory _productId
    ) external view returns (bool) {
        return products[_productId].exists;
    }
}