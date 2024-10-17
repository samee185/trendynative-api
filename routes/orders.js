const express = require("express");
const orderController = require("../controllers/orders");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Route to create a new order
router.post(
  "/create",
  authMiddleware.protectRoute,
  orderController.createOrder
);

// Route to get all orders (admin only)
router.get(
  "/",
  authMiddleware.protectRoute,
  authMiddleware.verifyIsAdmin,
  orderController.getOrders // Fetch all orders
);

// Route to get a specific order by ID
router.get(
  "/:orderId",
  authMiddleware.protectRoute,
  orderController.getOrderById // Fetch order by ID
);

// Route to update an order's status
router.patch(
  "/:orderId",
  authMiddleware.protectRoute,
  orderController.updateOrderStatus // Update order status
);

// Route to get the logged-in user's orders
router.get(
  "/my-orders",
  authMiddleware.protectRoute,
  orderController.getMyOrders
); // Fetch user's orders

module.exports = router;
