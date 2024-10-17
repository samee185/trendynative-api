const express = require("express");
const orderController = require("../controllers/orders");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/create",
  authMiddleware.protectRoute,
  orderController.createOrder
);

router.get(
  "/",
  authMiddleware.protectRoute,
  authMiddleware.verifyIsAdmin,
  orderController.getOrders 
);

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
