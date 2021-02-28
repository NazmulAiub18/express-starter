const express = require("express");

const auth = require("./auth");
const users = require("./users");
const emailTemplate = require("./emailTemplates");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/auth", auth);
router.use("/users", users);
router.use("/emailTemplates", emailTemplate);

module.exports = router;
