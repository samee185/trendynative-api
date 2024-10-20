const AppError = require("../utils/AppError");
const Products = require("../model/product");
const { dataUri } = require("../utils/multer");
const { uploader } = require("../utils/cloudinary");
const { validateCreateProduct } = require("../validation/productValidation");
const asyncHandler = require("express-async-handler");

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Products.find();
  res.status(200).json({
    status: "success",
    message: "All products fetched successfully",
    result: products.length,
    data: {
      products,
    },
  });
});

const createNewProduct = asyncHandler(async (req, res, next) => {
  console.log("Files:", req.files); // Log uploaded files
  console.log("Body:", req.body); // Log request body

  if (!req.files || req.files.length < 4) {
    throw new AppError("You must upload at least 4 images", 400);
  }

  // Image uploading process continues...
});


const getProductDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Products.findById(id);
  if (!product) {
    throw new AppError("Product with the specified ID not found", 401);
  }
  res.status(200).json({
    status: "success",
    message: "Product fetched successfully",
    data: {
      product,
    },
  });
});

const updateProductDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateDetails = req.body;

  if (!id) {
    throw new AppError("Please provide the product id", 400);
  }

  const updatedProduct = await Products.findByIdAndUpdate(id, updateDetails, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: {
      product: updatedProduct,
    },
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Products.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    message: "Product deleted successfully",
    data: null,
  });
});

module.exports = {
  getAllProducts,
  createNewProduct,
  getProductDetails,
  updateProductDetails,
  deleteProduct,
};
