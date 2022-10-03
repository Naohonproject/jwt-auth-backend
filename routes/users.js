const router = require("express").Router();

const usersControllers = require("../controllers/userControllers");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middleware/verifyToken");

// @routes GET api/users/
// @desc api to take all users in database
// @access Private
router.get("/", verifyToken, usersControllers.getAllUsers);

// @routes DELETE api/users/:userId
// @desc api to delete user by Id
// @access Private
router.delete("/:userId", verifyTokenAndAdmin, usersControllers.deleteUser);

module.exports = router;
