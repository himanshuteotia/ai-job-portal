const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    const user = new User({ username, email, password, fullName });
    await user.save();
    res.redirect("/login");
  } catch (error) {
    res.status(400).render("error", { message: "Error signing up" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Increase token expiration to 7 days
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // 7 days
    res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { error: "An error occurred during login" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("profile", { user });
  } catch (error) {
    res.status(500).render("error", { message: "Error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fullName });
    res.redirect("/profile");
  } catch (error) {
    res.status(500).render("error", { message: "Error updating profile" });
  }
};
