const models = require('./models');
const schemas = require('./schemas');
const controllers = require('./controllers');
const listeners = require('./listeners');
const { Module } = require('@farahub/framework/foundation');


class ProductsModule extends Module {

    /**
     * The module name
     * 
     * @var string
     */
    name = 'Products';

    /**
     * The module version
     * 
     * @var string
     */
    version = '1.0.0';

    /**
     * The module base path
     * 
     * use for routing 
     * 
     * @var string
     */
    basePath = '';

    /**
     * Register the module
     * 
     * @return void
     */
    register() {
        this.registerModels(models);
        this.registerSchemas(schemas);
        this.registerListeners(listeners);
        this.registerControllers(controllers);
    }
}

module.exports = ProductsModule;