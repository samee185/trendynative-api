const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const sendEmail = require("../utils/sendEmail");

const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    await sendEmail(req.user.email, "Order Placed", "orderPlaced", {
      name: req.user.name,
      orderId: createdOrder._id,
      totalPrice: createdOrder.totalPrice,
    });

    await sendEmail(
      process.env.ADMIN_EMAIL,
      "New Order Placed",
      "orderPlaced",
      {
        name: req.user.name,
        orderId: createdOrder._id,
        totalPrice: createdOrder.totalPrice,
      }
    );

    res.status(201).json(createdOrder);
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    order.status = status;
    const updatedOrder = await order.save();

    await sendEmail(
      order.user.email,
      "Order Status Updated",
      "orderStatusUpdated",
      {
        name: order.user.name,
        orderId: order._id,
        status: order.status,
      }
    );

    await sendEmail(
      process.env.ADMIN_EMAIL,
      "Order Status Updated",
      "orderStatusUpdated",
      {
        name: order.user.name,
        orderId: order._id,
        status: order.status,
      }
    );

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});


const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc Get all orders (Admin)
// @route GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
});

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getOrders,
};
