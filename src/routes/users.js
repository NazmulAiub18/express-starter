const { Router } = require("express");

const requireAuth = require("../middlewares/requireAuth");
// const user = require("../middlewares/user");

const me = (req, res) => {
  return res.json(req.user);
  // if (req.user) return res.json(req.user);
  // return res.json(null);
};

const router = Router();

router.get("/", (req, res) => {
  try {
    return res.json({ message: "USERS - 👋🌎🌍🌏" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
router.get("/me", requireAuth, me);

module.exports = router;
