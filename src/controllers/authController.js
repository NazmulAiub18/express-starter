const { verify } = require("jsonwebtoken");

const User = require("../models/User");
const { ROLE } = require("../utils/Roles");
const { AuthenticationError } = require("../utils/Errors");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require("../utils/token");

exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;
  //create user
  try {
    const user = await User.create({ name, email, password, role: ROLE.USER });
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    const valid = await user.validatePassword(password);

    if (!valid) {
      throw new AuthenticationError("bad password");
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.json({ user, accessToken: createAccessToken(user) });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  const token = req.cookies.jid;
  if (!token) {
    return next(new AuthenticationError("Please login again"));
  }

  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    console.log(err);
    return next(new AuthenticationError("Please login again"));
  }

  // token is valid and
  // we can send back an access token
  const user = await User.findById(payload.userId);

  if (!user) {
    return next(new AuthenticationError("Please login again"));
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return next(new AuthenticationError("Please login again"));
    //return res.send({ success: false, accessToken: "" });
  }

  sendRefreshToken(res, createRefreshToken(user));

  return res.send({ accessToken: createAccessToken(user) });
};

exports.logout = async (req, res) => {
  sendRefreshToken(res, "");

  return res.send(true);
};
