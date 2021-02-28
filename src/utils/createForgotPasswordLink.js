const { v4 } = require("uuid");

const { forgotPasswordPrefix } = require("../constants");

exports.createForgotPasswordLink = async (url, userId, redis) => {
  const id = v4();
  await redis.set(`${forgotPasswordPrefix}${id}`, userId, "ex", 60 * 20);
  return `${url}/change-password/${id}`;
};
