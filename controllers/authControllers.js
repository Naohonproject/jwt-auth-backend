const bcrypt = require("bcrypt");

const User = require("../models/User");
const TemplateError = require("../utils/errorTemplate");

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
          new TemplateError(
            false,
            "user name or email is already registered an account"
          )
        );
    }
    // check register password length
    const isPasswordValid = req.body.password.length > 6;
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new TemplateError(false, "Password must be longer than 6 "));
    }
    //   hash user password before save to db
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //   create new user by User model and save it to db
    const newUser = await new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
    });

    //   save created user to db
    const user = await newUser.save();

    //   return user info if save successfully
    return res.json(user);
  } catch (error) {
    res.status(500).json(new TemplateError(false, "Internal Server Error"));
  }
};

// login controller
exports.loginController = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });
    if (!user) {
      return res.status(404).json("Invalid user name or password");
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(404).json("Invalid user name or password");
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json(new TemplateError(false, error.message));
  }
};
