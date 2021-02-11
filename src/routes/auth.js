const { Router } = require("express");
const { verify } = require("jsonwebtoken");

const User = require("../models/User");
const { AuthenticationError } = require("../utils/Errors");
const { createAccessToken, createRefreshToken, sendRefreshToken } = require("../utils/token");

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  //create user
  try {
    const user = await User.create({ name, email, password, role: "user" });
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
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

const refreshToken = async (req, res) => {
  const token = req.cookies.jid;
  if (!token) {
    return res.send({ success: false, accessToken: "" });
  }

  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    console.log(err);
    return res.send({ success: false, accessToken: "" });
  }

  // token is valid and
  // we can send back an access token
  const user = await User.findById(payload.userId);

  if (!user) {
    return res.send({ success: false, accessToken: "" });
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.send({ success: false, accessToken: "" });
  }

  sendRefreshToken(res, createRefreshToken(user));

  return res.send({ success: true, accessToken: createAccessToken(user) });
};

const logout = async (req, res) => {
  sendRefreshToken(res, "");

  return res.send(true);
};

const router = Router();

router.get("/", (req, res) => {
  try {
    return res.json({ message: "AUTH - 👋🌎🌍🌏" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
router.post("/register", register);
router.post("/login", login);
router.get("/refresh_token", refreshToken);
router.get("/logout", logout);

module.exports = router;
