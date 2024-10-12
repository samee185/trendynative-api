const express = require("express");
const {
  getAllProducts,
  createNewProduct,
  getProductDetails,
  updateProductDetails,
  deleteProduct,
} = require("./../controllers/product");
const authMiddleware = require("./../middleware/auth");
const { imageUploads } = require("./../utils/multer");

const router = express.Router();
router
  .route("/")
  .get(getAllProducts)
  .post(authMiddleware.protectRoute, imageUploads, createNewProduct);

// router
//   .route("/admin")
//   .get(
//     authMiddleware.protectRoute,
//     authMiddleware.verifyIsAdmin,
//     getAllProductsByAdmin
//   );

router
  .route("/:id")
  .get(getProductDetails)
  .patch(updateProductDetails)
  .delete(deleteProduct);

module.exports = router;
