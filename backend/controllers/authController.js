const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const { isEmail, requireFields } = require("../utils/validators");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

const sendAuthResponse = (res, user, statusCode = 200) => {
  res.status(statusCode).json({
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

const registerUser = async (req, res, next) => {
  try {
    requireFields(req.body, ["name", "email", "password"]);
    const { name, email, password, role } = req.body;

    if (!isEmail(email)) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      throw new Error("User already exists with this email");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "employee"
    });

    await ActivityLog.create({
      user: user._id,
      action: "User registered",
      detail: `${user.name} created an ${user.role} account`
    });

    sendAuthResponse(res, user, 201);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    requireFields(req.body, ["email", "password"]);
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    await ActivityLog.create({
      user: user._id,
      action: "User login",
      detail: `${user.name} signed in`
    });

    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { registerUser, loginUser, getMe };
