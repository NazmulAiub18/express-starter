const yup = require("yup");

const minErr = (n) => `Must be minimum ${n} character long`;
const strTypeErr = "Must be a string";

const registerPasswordValidation = yup
  .string()
  .typeError(strTypeErr)
  .min(6, minErr(6))
  .max(255)
  .required();

exports.registerSchema = yup.object().shape({
  name: yup
    .string()
    .typeError(strTypeErr)
    .min(3, minErr(3))
    .max(255)
    .required(),
  email: yup
    .string()
    .typeError(strTypeErr)
    .min(3, minErr(3))
    .max(255)
    .email("Invalid email address")
    .required(),
  password: registerPasswordValidation,
});

exports.changePasswordSchema = yup.object().shape({
  newPassword: registerPasswordValidation,
});
