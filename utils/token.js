const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateAccessToken = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, admin: user.admin },
    process.env.ACCESS_TOKEN_PRIVATE_KEY,
    { expiresIn: "1m" }
  );
  return accessToken;
};

exports.generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user._id, admin: user.admin },
    process.env.REFRESH_TOKEN_PRIVATE_KEY,
    { expiresIn: "7d" }
  );
  return refreshToken;
};
