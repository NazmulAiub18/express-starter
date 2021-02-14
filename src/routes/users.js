const { Router } = require("express");

//controllers
const { me, getAll } = require("../controllers/userController");

//middlewares
const permission = require("../middlewares/permission");
const requireAuth = require("../middlewares/requireAuth");
const { ROLE } = require("../utils/Roles");

const router = Router();

router.get("/me", requireAuth, me);
router.get("/getAll", permission([ROLE.ADMIN]), getAll);

module.exports = router;
