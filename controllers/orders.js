const asyncHandler = require("express-async-handler");
const Order = require("../model/orders");
const sendEmail = require("../utils/email");
const AppError = require("../utils/AppError");

const createOrder = asyncHandler(async (orderData, user) => {
  const {
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = orderData;

  const order = new Order({
    user: user._id,
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  try {
    // Send email to user
    await sendEmail(user.email, "Order Confirmed", "orderPlaced", {
      name: user.firstname,
      orderId: createdOrder._id,
      totalPrice: createdOrder.totalPrice,
      orderItems: createdOrder.orderItems,
      shippingAddress: createdOrder.shippingAddress,
    });

    // Notify admin
    await sendEmail(process.env.ADMIN_EMAIL, "New Order Placed", "orderPlaced", {
      name: user.name,
      orderId: createdOrder._id,
      totalPrice: createdOrder.totalPrice,
    });
  } catch (error) {
    console.error("Email sending failed:", error); // Log email errors but continue
  }

  return createdOrder;
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (order) {
    res.json({
      status: "success",
      message: "Order successfully fetched",
      data: { order },
    });
  } else {
    throw new AppError("Order not found", 404);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (order) {
    order.status = status;
    const updatedOrder = await order.save();

    try {
      await sendEmail(order.user.email, "Order Status Updated", "orderStatusUpdated", {
        name: order.user.name,
        orderId: order._id,
        status: order.status,
      });

      await sendEmail(process.env.ADMIN_EMAIL, "Order Status Updated", "orderStatusUpdated", {
        name: order.user.name,
        orderId: order._id,
        status: order.status,
      });
    } catch (error) {
      console.error("Email sending failed::", error);
    }

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
