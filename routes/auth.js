const router = require("express").Router();
const { verifyToken } = require("../middleware/verifyToken");

const authControllers = require("../controllers/authControllers");

// @routes POST api/auth/register
// @desc api to register new user
// @access Public
router.post("/register", authControllers.registerController);

// @routes POST api/auth/login
// @desc api to login by Existed userName
// @access Public
router.post("/login", authControllers.loginController);

// @routes POST api/auth/refreshToken
// @desc api to refresh token
// @access Public
router.post("/refresh", authControllers.refreshTokenController);

// @routes POST api/auth/logout
// @desc api to log out user
// @access Public
router.post("/logout", verifyToken, authControllers.logoutController);

module.exports = router;
