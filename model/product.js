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
      min: [0, "Price must be greater than 0"],
      max: [10000, "Price must be less than 1000"],
      required: [true, "Please provide a price"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
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
