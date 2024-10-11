const express = require("express");
const userController = require("./../controllers/user");
const authMiddleware = require("./../middleware/auth");
const router = express.Router();

router.route("/").get(userController.getAllUsers);

router
  .route("/profile")
  .get(authMiddleware.protectRoute, userController.getUserProfile)
  .patch(authMiddleware.protectRoute, userController.updateProfile);

router
  .route("/update-password")
  .patch(authMiddleware.protectRoute, userController.updatePassword);

module.exports = router;