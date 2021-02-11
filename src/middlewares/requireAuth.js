const { verify } = require("jsonwebtoken");

const User = require("../models/User");
const { AuthenticationError } = require("../utils/Errors");

module.exports = async (req, _, next) => {
  const authorization = req.headers["authorization"];

  try {
    if (!authorization) {
      throw new AuthenticationError("not authenticated");
    }

    const token = authorization.split(" ")[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(payload.userId);
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};
