const express = require("express");
const userController = require("../controllers/user");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

router.route("/").get(authMiddleware.protectRoute,authMiddleware.verifyIsAdmin, userController.getAllUsers);

router
  .route("/profile")
  .get(authMiddleware.protectRoute, userController.getUserProfile)
  .patch(authMiddleware.protectRoute, userController.updateProfile);

router
  .route("/update-password")
  .patch(authMiddleware.protectRoute, userController.updatePassword);
module.exports = router;