const express = require("express");
const authController = require("../controllers/auth");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").post(authController.logOut);
router.route("/create-admin").post(authController.createAdminUser);
router.route("/admin-login").post(authController.logInAdmin);
router
  .route("/verify/:email/:verificationToken")
  .get(authController.verifyEmailAddress);

router.route("/forgot-password").post(authController.forgotPassword);
router
  .route("/resetPassword/:email/:resetToken")
  .patch(authController.resetPassword);

module.exports = router;
