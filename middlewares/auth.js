const Users = require("../model/user");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const protectRoute = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      console.log(req.headers.authorization);
      token = req.headers.authorization.split(" ")[1];
    }

    console.log(token);

    if (!token) {
      throw new AppError("You are not logged in, please login", 401);
    }

    const decoded = jwt.verify(token, process.env.jwtSecret);
    console.log(decoded);

    const user = await Users.findById(decoded.id);

    if (!user) {
      throw new AppError("User with the specified ID not found", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const verifyIsAdmin = async (req, res, next) => {
  try {
    console.log('---------testing ad---------',);
    if (req.user.role !== "admin") {
      throw new Error(
        "You are not authorized to access this route, this route belongs to admin users"
      );
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = { protectRoute, verifyIsAdmin };
