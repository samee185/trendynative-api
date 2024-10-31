const Users = require("../model/user");
const bcrypt = require("bcryptjs");
const signJwt = require("../utils/signJwt");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const {
  validateUserSignup,
  validateUserLogin,
} = require("../validation/userValidation");
const blackListModel = require("../model/blacklistToken");
const asyncHandler = require("express-async-handler");

const signup = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const validation = validateUserSignup(req.body);
  if (validation?.error) {
    throw new AppError(validation?.error.message, 400);
  }

  const { firstname, lastname, email, password } = req.body;

  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    throw new AppError("User with the email address already exists", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await Users.create({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  if (!user) {
    throw new AppError("Failed to create user account", 500);
  }

  await sendEmail({
    email: email,
    subject: "Welcome to Trendy Native Wears",
    template: "welcomeEmail",
    data: { firstName: firstname, lastName: lastname },
  });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedVerificationToken = await bcrypt.hash(verificationToken, salt);

  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify/${user.email}/${verificationToken}`;
  await sendEmail({
    email: email,
    subject: "Verify your email address",
    template: "verificationEmail",
    data: { firstName: firstname, verificationUrl: verificationUrl },
  });

  user.verification_token = hashedVerificationToken;
  await user.save();

  const token = signJwt(user._id);

  res.status(201).json({
    status: "success",
    data: { user, token },
  });
});

const createAdminUser = asyncHandler(async (req, res, next) => {
  const validation = validateUserSignup(req.body);
  if (validation?.error) {
    throw new AppError(validation.error.message, 400);
  }

  const { firstname, lastname, email, password } = req.body;
  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const adminUser = await Users.create({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    role: "admin",
  });

  if (!adminUser) {
    throw new AppError("Unable to create Admin", 500);
  }

  await sendEmail({
    email: email,
    subject: "Welcome to Trendy Native Wears",
    template: "welcomeEmail",
    data: { firstname: firstname, lastname: lastname },
  });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedVerificationToken = await bcrypt.hash(verificationToken, salt);

  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify/${adminUser.email}/${verificationToken}`;

  await sendEmail({
    email: email,
    subject: "Verify your email address",
    template: "verificationEmail",
    data: { firstname: firstname, verificationUrl: verificationUrl },
  });

  adminUser.verification_token = hashedVerificationToken;
  await adminUser.save();

  const token = signJwt(adminUser._id);

  res.status(201).json({
    status: "success",
    message: "Admin successfully created",
    data: { adminUser, token },
  });
});

const login = asyncHandler(async (req, res, next) => {
  const validation = validateUserLogin(req.body);
  if (validation?.error) {
    throw new AppError(validation?.error.message, 400);
  }

  const { email, password } = req.body;

  const user = await Users.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signJwt(user._id);

  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: { user, token },
  });
});

const logInAdmin = asyncHandler(async (req, res, next) => {
  const validation = validateUserLogin(req.body);
  if (validation?.error) {
    throw new AppError(validation?.error.message, 400);
  }

  const { email, password } = req.body;
  const adminUser = await Users.findOne({ email, role: "admin" }).select(
    "+password"
  );

  if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signJwt(adminUser._id);

  res.status(200).json({
    status: "success",
    message: "Admin user logged in successfully",
    data: { adminUser, token },
  });
});

const verifyEmailAddress = asyncHandler(async (req, res, next) => {
  const { email, verificationToken } = req.params;

  if (!email || !verificationToken) {
    throw new AppError("Please provide email and token", 400);
  }

  const user = await Users.findOne({ email });
  if (!user) {
    throw new AppError("User with the email not found", 404);
  }

  const tokenValid = await bcrypt.compare(
    verificationToken,
    user.verification_token
  );
  if (!tokenValid) {
    throw new AppError("Invalid token", 400);
  }

  user.email_verified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "User verified successfully",
    data: { user },
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Please provide email address", 404);
  }

  const user = await Users.findOne({ email });
  if (!user) {
    throw new AppError("User with the email not found", 404);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = await bcrypt.hash(resetToken, 10);

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${email}/${resetToken}`;

  await sendEmail({
    email: email,
    subject: "Reset your password",
    template: "resetPassword",
    data: { resetUrl },
  });

  user.reset_password_token = hashedResetToken;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Reset link sent to email",
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (!email || !resetToken || !password || !confirmPassword) {
    throw new AppError("Please provide all required fields", 400);
  }

  const user = await Users.findOne({ email });
  if (!user) {
    throw new AppError("User with the email not found", 404);
  }

  const tokenValid = await bcrypt.compare(
    resetToken,
    user.reset_password_token
  );
  if (!tokenValid) {
    throw new AppError("Invalid password reset token", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user.password = hashedPassword;
  user.reset_password_token = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});

const logOut = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      status: "Error",
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  await blackListModel.create({ token });
  res.status(200).json({
    status: "success",
    message: "logout successful",
  });
});

module.exports = {
  signup,
  createAdminUser,
  login,
  logInAdmin,
  verifyEmailAddress,
  forgotPassword,
  resetPassword,
  logOut,
};
