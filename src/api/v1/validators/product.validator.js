const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),
    categoryIds: Joi.array().items(Joi.number().integer()).required(), // Array of category IDs
    collectionIds: Joi.array().items(Joi.number().integer()).optional(), // Optional array of collection IDs
    isCustomizable: Joi.boolean().required(),
    storeId: Joi.number().integer().required(), // Store ID reference
});

module.exports = {
    productSchema
};
