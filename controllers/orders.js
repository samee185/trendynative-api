const asyncHandler = require("express-async-handler");
const Order = require("../model/orders");
const sendEmail = require("../utils/email");
const AppError = require("../utils/AppError");


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
    throw new AppError("No order items", 400);
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
    await sendEmail(req.user.email, "Order Confirmed", "orderPlaced", {
      name: req.user.firstname,
      orderId: createdOrder._id,
      totalPrice: createdOrder.totalPrice,
      orderItems: createdOrder.orderItems,
      shippingAddress: createdOrder.shippingAddress,
      orderLink: `https://yourstore.com/orders/${createdOrder._id}`,
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
    throw new AppError("Order not found", 404);
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
    throw new AppError("Order not found");
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

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
