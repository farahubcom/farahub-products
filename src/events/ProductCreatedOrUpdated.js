class ProductCreatedOrUpdated {

    /**
     * Modified product
     * 
     * @var Product
     */
    product;

    /**
     * Workspace connection
     * 
     * @var Connection
     */
    connection;

    /**
     * Authentiacated user
     * 
     * @var User
     */
    user;

    /**
     * Create event instance
     * 
     * @constructor
     * @param {Product} product Modified product
     * @param {Connection} connection Workspace connection
     * @param {User} user Authenticated user
     */
    constructor(product, connection, user) {
        this.product = product;
        this.connection = connection;
        this.user = user;
    }
}

module.exports = ProductCreatedOrUpdated;