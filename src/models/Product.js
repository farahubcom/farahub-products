const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class Product {

    /**
     * Generate new code for new creating product
     * 
     * @param {{ connection : object, inject: function }}
     * @return Number
     */
    static async generateCode() {
        try {
            const Product = this.model('Product');
            let code = 0;
            let exist = true;
            while (exist) {
                code += 1;
                exist = await Product.findOne({ code });
            }
            return code;
        } catch (error) {
            throw error
        }
    }

    /**
     * Create new or update an exsiting product
     * 
     * @param {Object} data data
     * @param {string} productId updating product
     * @returns modified product
     */
    static async createOrUpdate(data, productId, { inject }) {
        try {
            const Product = this.model('Product');

            // create or get instance
            const product = productId ? await Product.findById(productId) : new Product();

            // assign code
            product.code = data.code || await this.generateCode();

            // assign name
            product.name = {
                'fa-IR': data.name
            }

            // assign description
            product.description = {
                'fa-IR': data.description
            }

            // inject pre save hooks
            await inject('preSave', { product, data })

            // save the changed
            await product.save();

            // inject post save hooks
            await inject('postSave', { product, data })

            // return modified product
            return product;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Product;