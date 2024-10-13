const Users = require("../model/user");
const bcrypt = require("bcryptjs");
const signJWt = require("../utils/signJwt");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const {
  validateUserSignup,
  validateUserLogin,
} = require("../validation/userValidation");

const blackListModel = require("../model/blackListToken");

const signup = async (req, res, next) => {
  try {
    console.log(req.body);
    const validation = validateUserSignup(req.body);
    if (validation?.error) {
      throw new AppError(validation?.error.message, 400);
    }

    const { firstname, lastname, email, password } = req.body;

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      throw new Error("User with the email address already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
    const user = await Users.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    if (!user) {
      throw new Error("Failed to create user account");
    }

    await sendEmail({
      email: email,
      subject: "Welcome to Trendy Native Wears",
      template: "welcomeEmail", 
      data: {
        firstName: firstname,
        lastName: lastname,
      },
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    console.log(verificationToken);
    const hashedVerificationToken = await bcrypt.hash(verificationToken, salt);

    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verify/${user.email}/${verificationToken}`;
    await sendEmail({
      email: email,
      subject: "Verify your email address",
      template: "verificationEmail", 
      data: {
        firstName: firstname,
        verificationUrl: verificationUrl, 
      },
    });

    user.verification_token = hashedVerificationToken;
    await user.save();

    const token = signJWt(user._id);

    res.status(201).json({
      status: "success",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

const createAdminUser = async (req, res, next) => {
  try {
    const validation = validateUserSignup(req.body);
    if (!validation) {
      throw new AppError(validation?.error.message, 400);
    }
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = await users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
    });

    if (!adminUser) {
      throw new AppError("Unable to create Admin");
    }

    await sendEmail({
      email: email,
      subject: "Welcome to Trendy Native Wears",
      template: "welcomeEmail",
      data: {
        firstName: firstname,
        lastName: lastname,
      },
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    console.log(verificationToken);
    const hashedVerificationToken = await bcrypt.hash(verificationToken, salt);

    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verify/${user.email}/${verificationToken}`;
    await sendEmail({
      email: email,
      subject: "Verify your email address",
      template: "verificationEmail",
      data: {
        firstName: firstname,
        verificationUrl: verificationUrl,
      },
    });

    user.verification_token = hashedVerificationToken;
    await user.save();

    const token = signJWt(user._id);
    res.status(201).json({
      status: "success",
      message: "Admin successfully created",
      data: {
        adminUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validation = validateUserLogin(req.body);
    if (validation?.error) {
      throw new AppError(validation?.error.message, 400);
    }
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }

    const user = await Users.findOne({ email }).select("+password");
    console.log(user);


    if (!user || !(await user.comparePassword(password, user.password))) {
      throw new Error("Invalid email or password");
    }


    const token = signJWt(user._id);
    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

const logInAdmin = async (req, res, next) => {
  try {
    const validation = validateUserLogIn(req.body);
    if (validation?.error) {
      throw new AppError(validation?.error.message, 400);
    }
    const { email, password } = req.body;
    const adminUser = await users
      .findOne({ email, role: "admin" })
      .select("+password");
    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      throw new AppError("email or password invalid", 401);
    }
    const token = generateToken(adminUser._id);
    res.status(200).json({
      status: "success",
      message: "Admin user logged in successfully",
      data: {
        adminUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmailAddress = async (req, res, next) => {
  try {
    const { email, verificationToken } = req.params;

    if (!email || !verificationToken) {
      throw new Error("Please provide email and token");
    }
    const user = await Users.findOne({ email });
    if (!user) {
      throw new Error("User with the email not found");
    }
    const tokenValid = await bcrypt.compare(
      verificationToken,
      user.verification_token
    );

    if (!tokenValid) {
      throw new Error("failed to verify user - Invalid tokne");
    }

    user.email_verified = true;
    await user.save();
    res.status(200).json({
      status: "success",
      message: "User verified successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};


const forgotPassword = async (req, res, next) => {
  try {
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

    const resetMessage = `Please click on the link below to reset your password. \n ${resetUrl} `;

    const resetMailOptions = {
      email: email,
      subject: "Reset your password",
      message: resetMessage,
    };

    await sendEmail(resetMailOptions);

    user.reset_password_token = hashedResetToken;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Reset link sent to email",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken } = req.params;
    const { password, confirmPassword } = req.body;

    if (!email || !resetToken || !password || !confirmPassword) {
      throw new AppError("Please provide all required fields", 404);
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
      throw new AppError("Invalid password reset token", 404);
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
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const logOut = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({
        status: "Error",
        message: "No token provided",
      });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(403).json({
        status: "Error",
        message: "No token provided",
      });
    }
    await blackListModel.create({ token });
    res.status(200).json({
      status: "success",
      message: "logout successful",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

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
