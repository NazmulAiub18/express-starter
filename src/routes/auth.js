const { Router } = require("express");

//controllers
const {
  register,
  confirm,
  login,
  refreshToken,
  sendForgotPasswordEmail,
  forgotPasswordChange,
  logout,
} = require("../controllers/authController");

//middlewares
const validate = require("../middlewares/validate");

//validationSchemas
const {
  registerSchema,
  changePasswordSchema,
} = require("../validationSchemas/authSchemas");

const router = Router();

router.post("/register", validate(registerSchema), register);
router.get("/confirm/:id", confirm);
router.post("/login", login);
router.get("/refresh_token", refreshToken);
router.post("/send_forgot_password_email", sendForgotPasswordEmail);
router.post(
  "/forgot_password_change",
  validate(changePasswordSchema),
  forgotPasswordChange,
);
router.get("/logout", logout);

module.exports = router;
