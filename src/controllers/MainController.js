const { Controller } = require('@farahub/framework/foundation');
const { Auth, Injection, Validator, Lang, Num, Event, Doc, Workspace } = require('@farahub/framework/facades');
const mongoose = require('mongoose');
const flatten = require('lodash/flatten');

const ProductListValidator = require('../validators/ProductListValidator');
const CreateOrUpdateProductValidator = require('../validators/CreateOrUpdateProductValidator');
const ProductCreatedOrUpdated = require('../events/ProductCreatedOrUpdated');
const ProductDetailsValidator = require('../validators/ProductDetailsValidator');
const ProductDeleteValidator = require('../validators/ProductDeleteValidator');

const { ObjectId } = mongoose.Types;


class MainController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Main';

    /**
     * The controller name
     * 
     * @var string
     */
    basePath = '/products';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/',
            handler: 'list',
        },
        {
            type: 'api',
            method: 'get',
            path: '/new/code',
            handler: 'newCode',
        },
        {
            type: 'api',
            method: 'post',
            path: '/',
            handler: 'createOrUpdate',
        },
        {
            type: 'api',
            method: 'get',
            path: '/:productId',
            handler: 'details',
        },
        {
            type: 'api',
            method: 'delete',
            path: '/:productId',
            handler: 'delete',
        },
    ]

    /**
     * List of products match params
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.list'),
            Validator.validate(new ProductListValidator()),
            async function (req, res, next) {
                try {

                    const args = req.query;
                    const { inject, wsConnection: connection, user } = req;

                    const Product = connection.model('Product');

                    const searchInjections = await inject('search', { user, req });

                    let search = {
                        ...(searchInjections && Object.assign({},
                            ...searchInjections
                        ))
                    }

                    if (args && args.query && args.query !== '') {
                        search = {
                            ...search,
                            ...(
                                Num.isNumeric(args.query) ?
                                    { code: Number(args.query) } :
                                    { "name.fa-IR": { $regex: args.query + '.*' } }
                            )
                        }
                    }

                    const sort = args && args.sort ? args.sort : "-createdAt";

                    const populationInjections = await req.inject('populate');

                    const query = Product.find(search)
                        .select('code name description updatedAt')
                        .populate([
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Product.find(search).count();

                    if (args && args.page > -1) {
                        const perPage = args.perPage || 25;
                        query.skip(args.page * perPage)
                            .limit(perPage)
                    }

                    let data = await query.lean({ virtuals: true });

                    data = Lang.translate(data);

                    return res.json({ ok: true, data, total });
                } catch (error) {
                    next(error)
                }
            }
        ]
    }

    /**
     * Get new code for new creating product
     * 
     * @return void
     */
    newCode() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.newCode'),
            async function (req, res, next) {
                try {

                    const { wsConnection: connection, inject } = req;
                    const Product = req.wsConnection.model('Product');
                    const code = await Product.generateCode({ inject, connection });
                    return res.json({ ok: true, code })
                } catch (error) {
                    next(error)
                }
            }
        ]
    }

    /**
     * Create or upadte an existing product
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    createOrUpdate() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.createOrUpdate'),
            Validator.validate(new CreateOrUpdateProductValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const { inject, wsConnection: connection } = req;

                    const Product = connection.model('Product');

                    const product = await Product.createOrUpdate(data, data.id, { inject, connection });

                    // log the activity
                    req.event(new ProductCreatedOrUpdated(product, req.wsConnection, req.user));

                    // return response
                    return res.json({ ok: true });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get product details
     * 
     * @param {*} req request
     * @param {*} res response
     */
    details() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.details'),
            Validator.validate(new ProductDetailsValidator()),
            async function (req, res, next) {
                try {

                    const { productId } = req.params;
                    const { wsConnection: connection, inject } = req;

                    const populationInjections = await inject('populate');

                    const Product = connection.model('Product');

                    const query = Product.findById(productId)
                        .select('-__v')
                        .populate([
                            ...(populationInjections || [])
                        ]);

                    const response = await query.lean({ virtuals: true });

                    const product = Lang.translate(response);

                    return res.json({ ok: true, product })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Delete an existing product from db
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    delete() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.delete'),
            Validator.validate(new ProductDeleteValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const { productId } = req.params;
                    const { wsConnection: connection, inject } = req;

                    const Product = connection.model('Product');

                    // get product document
                    const product = await Doc.resolve(productId, Product);

                    // check if product can be deleted
                    const injectedRelations = await inject('relations', { product, connection }) || [];

                    if (flatten(injectedRelations).length > 0) {
                        return res.json({
                            ok: false,
                            status: 0,
                            message: 'Can not be deleted',
                            relations: flatten(injectedRelations)
                        });
                    }

                    // inject delete pre hook
                    await inject('preDelete', { product });

                    // delete the product
                    await Product.deleteOne({ _id: product.id });

                    // inject delete post hook
                    await inject('postDelete');

                    // dispatch event
                    // req.event(new ProductDeleted(product, req.wsConnection, req.user));

                    // return response
                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = MainController;