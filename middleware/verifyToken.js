const jwt = require("jsonwebtoken");
const ResponseTemplate = require("../utils/ResponseTemplate");

exports.verifyToken = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_PRIVATE_KEY,
      (error, decoded) => {
        if (error) {
          return res
            .status(403)
            .json(new ResponseTemplate(false, "access token invalid", null));
        }
        req.user = decoded;
        next();
      }
    );
  } else {
    return res
      .status(401)
      .json(new ResponseTemplate(false, "Not Authenticated", null));
  }
};

exports.verifyTokenAndAdmin = (req, res, next) => {
  this.verifyToken(req, res, () => {
    if (req.user.id == req.params.userId || req.user.admin) {
      return next();
    } else {
      return res.json(
        new ResponseTemplate(false, "you don't have right to do this", null)
      );
    }
  });
};
