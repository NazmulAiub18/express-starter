const yup = require("yup");

module.exports = yup.object().shape({
  name: yup.string().min(3, "nameNotLongEnough").max(255).required(),
  email: yup.string().min(3, "emailNotLongEnough").max(255).email("invalidEmail").required(),
  password: yup.string().min(6, "passwordNotLongEnough").max(255).required(),
});
