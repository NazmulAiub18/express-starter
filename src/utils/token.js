const { sign } = require("jsonwebtoken");

const createAccessToken = (user) => {
  return sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (user) => {
  return sign(
    { userId: user._id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

const sendRefreshToken = (res, token) => {
  res.cookie("jid", token, {
    httpOnly: true,
    path: "/api/v1/auth/refresh_token",
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
};
