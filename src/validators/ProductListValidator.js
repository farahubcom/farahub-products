class ProductListValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            query: {
                in: ["query"],
                optional: true,
                isString: true
            },
            sort: {
                in: ["query"],
                optional: true,
                isString: true
            },
            page: {
                in: ["query"],
                optional: true,
                isInt: true,
                toInt: true
            },
            perPage: {
                in: ["query"],
                optional: true,
                isInt: true,
                toInt: true
            },
        }
    }
}

module.exports = ProductListValidator;