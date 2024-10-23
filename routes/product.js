const express = require("express");
const {
  getAllProducts,
  createNewProduct,
  getProductDetails,
  updateProductDetails,
  deleteProduct,
} = require("../controllers/product");
const authMiddleware = require("../middlewares/auth");
const { imageUploads, ensureMinImages } = require("../utils/multer");

const router = express.Router();
router
  .route("/")
  .get(getAllProducts);

router
  .route("/create-product")
  .post(
    authMiddleware.protectRoute,
    authMiddleware.verifyIsAdmin,
    imageUploads,
    ensureMinImages,
    createNewProduct
  );  
 

router
  .route("/:id")
  .get(getProductDetails)
  .patch(authMiddleware.protectRoute, authMiddleware.verifyIsAdmin, updateProductDetails)
  .delete(authMiddleware.protectRoute, authMiddleware.verifyIsAdmin, deleteProduct);

module.exports = router;
