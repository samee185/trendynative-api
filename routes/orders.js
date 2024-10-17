const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.route("/create").post( authMiddleware.protectRoute, createOrder);
router
  .route("/")
  .get(
    authMiddleware.protectRoute,
    authMiddleware.verifyIsAdmin,
    orderController.getAllOrders
  );
router
  .route("/:orderId")
  .get(authMiddleware.protectRoute, orderController.getOrderDetails);
router
  .route("/:orderId")
  .patch(authMiddleware.protectRoute, orderController.updateOrderDetails);
router
  .route("/:orderId")
  .delete(authMiddleware.protectRoute, orderController.deleteOrder);

module.exports = router;
