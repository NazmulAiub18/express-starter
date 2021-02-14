const { verify } = require("jsonwebtoken");

const User = require("../models/User");
const { AuthenticationError, AuthorizationError } = require("../utils/Errors");

module.exports = function (roleArray) {
  return async (req, _, next) => {
    const authorization = req.headers["authorization"];

    try {
      if (!authorization) {
        throw new AuthenticationError("not authenticated");
      }

      const token = authorization.split(" ")[1];
      const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(payload.userId);
      if (!roleArray.includes(user.role)) {
        throw new AuthorizationError(
          "You don't have enough permission to perform this action",
        );
      }
      req.user = user;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
