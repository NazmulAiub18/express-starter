const logger = require("../libs/logger");
const User = require("../models/User");
const { sendEmailNotification } = require("./EmailNotification");

const oneMonthBefore = new Date();
oneMonthBefore.setDate(oneMonthBefore.getDate() - 30);

module.exports = [
  {
    name: "sendEmailFromNotification",
    fn: async (job) => {
      await sendEmailNotification();
    },
    interval: "one minute",
  },
  {
    name: "removeUnverifiedAccounts",
    fn: async (job) => {
      const result = await User.deleteMany({
        createdAt: {
          $lte: oneMonthBefore,
        },
        verified: false,
      });
      logger.warn(
        result.deletedCount + " unverified and expired account removed!",
      );
    },
    interval: "one day",
  },
];
