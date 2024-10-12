const AppError = require("../utils/AppError");
const Products = require("./../model/product");
const { dataUri } = require("./../utils/multer");
const { uploader } = require("./../utils/cloudinary");
const { validateCreateProduct } = require("./../validations/productValidation");
const getAllProducts = async (req, res) => {
  try {
    const products = await Products.find()
    res.status(200).json({
      status: "success",
      message: "All products fetched successfully",
      result: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error)
  }
};

const createNewProduct = async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 4) {
      throw new AppError("You must upload at least 4 images", 400);
    }
    const uploadPromises = req.files.map((file) => {
      const fileData = dataUri(file).content;
      return uploader.upload(fileData, {
        folder: "TrendyNativeWears/Products",
      });
    });
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);
    const validation = validateCreateProduct(req.body);
    if (validation.error) {
      throw new AppError(validation.error.message, 400);
    }

    const { title, price, description, category, size } = req.body;

  
    const newProduct = await Products.create({
      title,
      price,
      description,
      category,
      size,
      images: imageUrls, 
    });

    if (!newProduct) {
      throw new AppError("An error occurred while creating the product", 404);
    }

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};


const getProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("Heyyyyyyyyyyyyyyyyy");
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
  } catch (error) {
    next(error);
  }
};

const updateProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updateDetails = req.body;
    if (!id) {
      throw new Error("Please provide the product id");
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
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: "An error occurred with message: " + error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Products.findByIdAndDelete(id);
    res.status(204).json({
      status: "success",
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: "An error occurred with message: " + error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  createNewProduct,
  getProductDetails,
  updateProductDetails,
  deleteProduct,
};
