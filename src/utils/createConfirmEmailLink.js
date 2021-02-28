const { v4 } = require("uuid");

// => https://my-site.com/confirm/<id>
exports.createConfirmEmailLink = async (url, userId, redis) => {
  const id = v4();
  await redis.set(id, userId, "ex", 60 * 60 * 24);
  return `${url}/api/v1/auth/confirm/${id}`;
};
