const { ValidationError } = require("../utils/Errors");

const formatYupError = require("../utils/formatYupError");
const register = require("../validationSchemas/register");

module.exports = async (req, res, next) => {
  let schema = null;

  switch (req.url) {
    case "/auth/register":
      schema = register;
      break;

    default:
      break;
  }

  if (!schema) {
    return next();
  }
  try {
    await schema.validate(req.body, { abortEarly: false });
    return next();
  } catch (err) {
    return next(new ValidationError(err.message, formatYupError(err)));
  }
};
