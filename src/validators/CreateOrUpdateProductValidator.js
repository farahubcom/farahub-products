const { Doc } = require("@farahub/framework/facades");
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class CreateOrUpdateProductValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            id: {
                in: ["body"],
                optional: true,
                isMongoId: {
                    bail: true
                },
                custom: {
                    options: (value, { req }) => {
                        const Product = req.wsConnection.model('Product');
                        return Doc.resolve(value, Product).then(product => {
                            if (!product)
                                return Promise.reject('کالا یافت نشد.');
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
            },
            code: {
                in: ["body"],
                isInt: true,
                toInt: true,
                notEmpty: true,
                errorMessage: "ورود کد اجباری می باشد.",
                custom: {
                    options: (value, { req }) => {

                        if (req.body.id) return true;

                        const Product = req.wsConnection.model('Product');

                        return Product.findOne({ code: value }).then(product => {
                            if (product) {
                                return Promise.reject('کد قبلا ثبت شده است.');
                            }
                        });
                    }
                },
            },
            name: {
                in: ["body"],
                isString: true,
                notEmpty: true,
                errorMessage: "نام کالا اجباری است."
            },
            description: {
                in: ["body"],
                optional: true,
                isString: true,
            },
        }
    }
}

module.exports = CreateOrUpdateProductValidator;