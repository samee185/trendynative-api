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
      images: joi
      .array()
      .items(
        joi.string().required().error(new Error("Each image must be a string"))
      )
      .min(4)
      .max(6)
      .required()
      .error(new Error("Please provide between 4 and 6 images")),
    category: joi
      .string()
      .required()
      .error(new Error("Please provide a product category")),
    size: joi
      .string()
      .required()
      .error(new Error("Please provide a product size"))
  });

  return schema.validate(object);
};

module.exports = {
  validateCreateProduct,
};