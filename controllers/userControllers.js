const User = require("../models/User");
const jwt = require("jsonwebtoken");

const ResponseTemplate = require("../utils/ResponseTemplate");

// get all users info
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res
      .status(200)
      .json(new ResponseTemplate(false, "Successfully", users));
  } catch (error) {
    return res
      .status(500)
      .json(new ResponseTemplate(false, error.message, null));
  }
};

// delete users by userId
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndDelete(userId);
    return res
      .status(200)
      .json(new ResponseTemplate(true, "delete successfully", user._id));
  } catch (error) {
    return res
      .status(500)
      .json(new ResponseTemplate(false, error.message, null));
  }
};
