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
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["men", "women", "unisex"],
        message:
          "Category must be one of the following: Men, Women, Kids",
      },
    },
    subCategory: {
      type: String,
      enum: {
        values: ["yoruba", "igbo", "hausa", "edo", "aso-oke", "agbada", "shoes"],
        message:
          "Category must be one of the following: Yoruba, Igbo, Hausa, Edo, Aso-oke, Agbada, Shoes"
      },
    },
    sizes: {
      type: [String],
      enum: {
        values: ["Small", "Medium", "Large", "XL", "2XL", "3XL"],
        message:
          "Size must be one of the following: Small, Medium, Large, XL, 2XL, 3XL",
       },
    },
  },
  {
    timestamps: true,
  }
);

const Products = mongoose.model("Products", productSchema);
module.exports = Products;
