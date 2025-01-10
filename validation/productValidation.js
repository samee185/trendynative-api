const joi = require("joi");

const validateCreateProduct = (object) => {
  const schema = joi.object().keys({
    title: joi
      .string()
      .required()
      .error(new Error("Please provide product title")),
    price: joi
      .number()
      .required()
      .min(0)
      .max(10000000)
      .error(new Error("Please provide a price between 0 and 10000000")),
    description: joi
      .string()
      .required()
      .error(new Error("Please provide a product description")),
    category: joi
      .string() 
      .error(new Error("Please provide a product category")),
    subCategory: joi
      .string()
      .error(new Error("Please provide a product category")),
    size: joi
      .array()
      .items(joi.string().valid("Small", "Medium", "Large", "XL", "2XL", "3XL"))
      .error(new Error("Please provide a product size")),
  });

  return schema.validate(object);
};

module.exports = {
  validateCreateProduct,
};