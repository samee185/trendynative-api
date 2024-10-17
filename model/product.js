const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      unique: [true, "Title must be unique"],
      trim: true,
    },
    price: {
      type: Number,
      min: [1000, "Price must be greater than 1000"],
      max: [100000000, "Price must be less than 100000000"],
      required: [true, "Please provide a price"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    images: {
      type: [String],
      required: [true, "At least 4 images are required"],
      validate: {
        validator: function (value) {
          return value.length >= 4 && value.length <= 6;
        },
        message: "A product must have between 4 and 6 images",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    size: {
      type: String,
      required: [true, "Size is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Products = mongoose.model("Products", productSchema);
module.exports = Products;