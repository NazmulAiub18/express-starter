const { Router } = require("express");

//controllers
const {
  register,
  login,
  refreshToken,
  logout,
} = require("../controllers/authController");

//middlewares
const validate = require("../middlewares/validate");

//validationSchemas
const registerSchema = require("../validationSchemas/register");

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", login);
router.get("/refresh_token", refreshToken);
router.get("/logout", logout);

module.exports = router;
