const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const { isEmail } = require("../utils/validators");

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (name) user.name = name.trim();
    if (email) {
      if (!isEmail(email)) {
        res.status(400);
        throw new Error("Please provide a valid email address");
      }

      const duplicate = await User.findOne({ email, _id: { $ne: user._id } });
      if (duplicate) {
        res.status(409);
        throw new Error("Email is already in use");
      }
      user.email = email.trim().toLowerCase();
    }
    if (password) {
      if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
      }
      user.password = password;
    }

    await user.save();
    await ActivityLog.create({
      user: user._id,
      action: "Profile updated",
      detail: `${user.name} updated profile information`
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile };
