const User = require("../models/User");

exports.me = (req, res) => {
  return res.json({ user: req.user });
};

exports.getAll = async (_, res) => {
  return res.json(await User.find({}));
};
