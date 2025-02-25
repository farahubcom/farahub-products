const { Doc } = require("@farahub/framework/facades");
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class ProductDetailsValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            productId: {
                in: ["params"],
                isMongoId: {
                    bail: true
                },
                custom: {
                    options: (value, { req }) => {
                        const Product = req.wsConnection.model('Product');
                        return Doc.resolve(value, Product).then(product => {
                            if (!product)
                                return Promise.reject(false);
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
                customSanitizer: {
                    options: (value, { req }) => {
                        return ObjectId(value);
                    }
                }
            }
        }
    }

    /**
     * Custom validation formatter
     * 
     * @returns {func}
     */
    toResponse(res, { errors }) {
        return res.status(404).json({
            ok: false,
            message: 'Product not found'
        })
    }
}

module.exports = ProductDetailsValidator;