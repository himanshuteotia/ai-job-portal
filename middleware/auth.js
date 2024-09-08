const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res.clearCookie("token");
        return res.redirect("/login?expired=true");
      }
      throw error;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.clearCookie("token");
    res.redirect("/login");
  }
};
