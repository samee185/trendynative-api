const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/orders");
const paymentRoute = require("./routes/payment");
const { cloudinaryConfig } = require("./utils/cloudinary");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors("*"));
app.use("*", cloudinaryConfig);

app.use("/api/v1/userss", userRoutes);
app.use("/api/v1/auths", authRoutes);
app.use("/api/v1/productss", productRoutes);
app.use("/api/v1/orderss", orderRoutes );
app.use("/api/v1/paymentssssssssss", paymentRoute);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} with method ${req.method} on this server. Route not defined`,
  });
});


module.exports = app;