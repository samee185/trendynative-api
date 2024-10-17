const bcrypt = require("bcryptjs");
const Users = require("../model/user");
const AppError = require("../utils/AppError");
const asyncHandler = require("express-async-handler");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await Users.find();

  if (!users) {
    throw new AppError("No users found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "All users fetched successfully",
    result: users.length,
    data: {
      users,
    },
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await Users.findById(userId);
  if (!user) {
    throw new AppError(`User not found with id of ${userId}`, 404);
  }
  const fullname = user.getFullName();

  res.status(200).json({
    status: "success",
    message: "User fetched successfully",
    data: {
      user,
      fullname,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await Users.findById(userId);
  if (!user) {
    throw new AppError(`User not found with id of ${userId}`, 404);
  }

  const allowedFields = ["firstname", "lastname", "bio"];
  const fieldsToUpdate = Object.keys(req.body);
  fieldsToUpdate.forEach((field) => {
    if (allowedFields.includes(field)) {
      user[field] = req.body[field];
    } else {
      throw new AppError(
        `Field ${field} is not allowed to be updated using this route`,
        400
      );
    }
  });
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await Users.findById(userId).select("+password");
  if (!user) {
    throw new AppError(`User not found with id of ${userId}`, 404);
  }

  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    throw new AppError(
      "Please provide both old and new and confirm password",
      400
    );
  }

  const isPasswordValid = await user.comparePassword(
    oldPassword,
    user.password
  );
  if (!isPasswordValid) {
    throw new AppError("Old password is incorrect", 400);
  }

  if (oldPassword === newPassword) {
    throw new AppError("New password cannot be the same as old password", 400);
  }

  if (newPassword !== confirmNewPassword) {
    throw new AppError(
      "New password and confirm new password do not match",
      400
    );
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    data: {
      user,
    },
  });
});

module.exports = {
  getAllUsers,
  getUserProfile,
  updateProfile,
  updatePassword,
};
