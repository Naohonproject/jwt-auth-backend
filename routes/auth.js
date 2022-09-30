const router = require("express").Router();

const authControllers = require("../controllers/authControllers");

// @routes POST api/auth/register
// @desc api to register new user
// @access Public
router.post("/register", authControllers.registerController);

// @routes POST api/auth/login
// @desc api to login by Existed userName
// @access Public
router.post("/login", authControllers.loginController);

module.exports = router;
