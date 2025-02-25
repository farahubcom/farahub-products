const ProductCreatedOrUpdated = require("../events/ProductCreatedOrUpdated");
const ProductDeleted = require("../events/ProductDeleted");
const LogProductDeletionActivity = require("./LogProductDeletionActivity");
const LogProductModificationActivity = require("./LogProductModificationActivity");


module.exports = new Map([
    [
        ProductCreatedOrUpdated, [
            LogProductModificationActivity,
        ],

        ProductDeleted, [
            LogProductDeletionActivity,
        ]
    ]
]);