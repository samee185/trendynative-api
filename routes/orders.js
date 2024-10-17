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
  orderController.getOrderById 
);


router.patch(
  "/:orderId",
  authMiddleware.protectRoute,
  orderController.updateOrderStatus 
);

router.get(
  "/my-orders",
  authMiddleware.protectRoute,
  orderController.getMyOrders
); 

module.exports = router;
