const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const ResponseTemplate = require("../utils/ResponseTemplate");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

// fake database for storing refresh token
let refreshTokens = [];

// register controller
// this we do not need to check user name or email password existed
// because the schema set up that data is unique and required
// if these things not match , mongodb will throw error then error
// go into catch block , we return it to user with server error
exports.registerController = async (req, res) => {
  try {
    // check whether user and email that exist in database or not to response to client error to represent error
    // message , therefore message is more specific further just server error from mongodb
    const isExistedUser = await User.findOne({
      email: req.body.email,
    });
    if (isExistedUser) {
      return res
        .status(401)
        .json(
          new ResponseTemplate(
            false,
            "user name or email is already registered an account",
            null
          )
        );
    }
    // check register password length
    const isPasswordValid = req.body.password.length > 6;
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(
          new ResponseTemplate(false, "Password must be longer than 6 ", null)
        );
    }
    //   hash user password before save to db
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //   create new user by User model and save it to db
    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
    });

    //   save created user to db
    const user = await newUser.save();

    //   return user info if save successfully
    return res.json(new ResponseTemplate(true, "successfully", user));
  } catch (error) {
    res
      .status(500)
      .json(new ResponseTemplate(false, "Internal Server Error", null));
  }
};

// login controller
exports.loginController = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });
    if (!user) {
      return res
        .status(404)
        .json(
          new ResponseTemplate(false, "Invalid user name or password", null)
        );
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res
        .status(404)
        .json(
          new ResponseTemplate(true, "Invalid user name or password", null)
        );
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push({ userId: user._id, refreshToken });

    // save refresh token to cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: false,
    });

    const { password, ...userInfo } = user._doc;

    const responseData = { accessToken, ...userInfo };
    return res
      .status(200)
      .json(new ResponseTemplate(true, "Successfully", responseData));
  } catch (error) {
    res.status(500).json(new ResponseTemplate(false, error.message, null));
  }
};

exports.refreshTokenController = async (req, res) => {
  // take refresh token from client
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json(new ResponseTemplate(false, "Unauthenticated ", null));
  }
  const existRefreshToken = refreshTokens.find(
    (data) => data.refreshToken === refreshToken
  );
  if (!existRefreshToken) {
    return res.json(
      new ResponseTemplate(false, "Refresh token is invalid", null)
    );
  }
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_PRIVATE_KEY,
    (error, decoded) => {
      if (error) {
        console.log(error);
      }
      refreshTokens = refreshTokens.filter(
        (token) => token.refreshToken !== refreshToken
      );
      // create new access token and refresh token
      const newAccessToken = generateAccessToken(decoded);
      const newRefreshToken = generateRefreshToken(decoded);
      refreshTokens.push({ refreshToken: newRefreshToken, userId: decoded.id });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: false,
      });
      return res
        .status(200)
        .json(
          new ResponseTemplate(
            true,
            "refresh access token successfully",
            newAccessToken
          )
        );
    }
  );
};

// logout
exports.logoutController = async (req, res) => {
  // clear cookie
  res.clearCookie("refreshToken");

  // clear refresh token in database
  refreshTokens = refreshTokens.filter(
    (token) => token.refreshToken !== req.cookies.refreshToken
  );

  // clear access token in client

  return res
    .status(200)
    .json(new ResponseTemplate(true, "log out successfully", null));
};
