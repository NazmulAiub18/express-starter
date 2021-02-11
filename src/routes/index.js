const express = require("express");

const auth = require("./auth");
const users = require("./users");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/auth", auth);
router.use("/users", users);

module.exports = router;
