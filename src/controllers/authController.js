const { verify } = require("jsonwebtoken");

const User = require("../models/User");
const EmailTemplate = require("../models/EmailTemplate");
const redis = require("../libs/redis");
const logger = require("../libs/logger");
const { forgotPasswordPrefix } = require("../constants");

const { ROLE } = require("../utils/Roles");
const { AuthenticationError, BadRequestError } = require("../utils/Errors");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require("../utils/token");
const {
  createBulkEmailNotification,
  sendEmailNotification,
} = require("../utils/EmailNotification");
const { createConfirmEmailLink } = require("../utils/createConfirmEmailLink");
const {
  createForgotPasswordLink,
} = require("../utils/createForgotPasswordLink");

exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    //check email template
    const registerEmailTemplate = await EmailTemplate.findOne({
      name: "registration_verification",
    });
    if (!registerEmailTemplate) {
      throw new Error("Registration verification email template not found");
    }
    //check already exists
    const userAlreadyExists = await User.exists({
      email,
    });

    if (userAlreadyExists) {
      throw new BadRequestError("Email already registered");
    }
    //create user
    const user = await User.create({ name, email, password, role: ROLE.USER });
    const url = await createConfirmEmailLink(
      res.locals.BACKEND_HOST,
      user._id,
      redis,
    );
    //save to notification
    await createBulkEmailNotification([
      {
        user_id: user._id,
        recipient: user.email,
        subject: registerEmailTemplate.subject,
        body: registerEmailTemplate.content,
        data: {
          url,
          linkText: "Confirm Registration",
        },
        schedule: "emergency",
      },
    ]);
    //send email
    await sendEmailNotification();

    return res.json({
      message:
        "A verification mail has been sent to your email address, please verify your email address",
    });
  } catch (err) {
    next(err);
  }
};

exports.confirm = async (req, res, next) => {
  const { id } = req.params;

  try {
    const userId = await redis.get(id);
    if (userId) {
      await User.updateOne({ _id: userId }, { verified: true });
      await redis.del(id);
      return res.redirect(`${process.env.FRONTEND_HOST}/login`);
    } else {
      throw new BadRequestError("invalid");
    }
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError("Wrong email or password");
    }
    //check verified email
    if (!user.verified) {
      throw new AuthenticationError("Please verify your email address");
    }

    const valid = await user.validatePassword(password);

    if (!valid) {
      throw new AuthenticationError("Wrong email or password");
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.json({ user, accessToken: createAccessToken(user) });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  const token = req.cookies.jid;
  const loginAgainMsg = "Please login again";
  if (!token) {
    return next(new AuthenticationError(loginAgainMsg));
  }

  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    logger.error(err);
    return next(new AuthenticationError(loginAgainMsg));
  }

  // token is valid and
  // we can send back an access token
  const user = await User.findById(payload.userId);

  if (!user) {
    return next(new AuthenticationError(loginAgainMsg));
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return next(new AuthenticationError(loginAgainMsg));
  }

  sendRefreshToken(res, createRefreshToken(user));

  return res.send({ accessToken: createAccessToken(user) });
};

exports.sendForgotPasswordEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    //check email template
    const forgotPasswordEmailTemplate = await EmailTemplate.findOne({
      name: "forgot_password",
    });
    if (!forgotPasswordEmailTemplate) {
      throw new Error("Forgot password email template not found");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message:
          "An Email has been sent to your email address, please check your email address",
      });
    }

    const url = await createForgotPasswordLink(
      process.env.FRONTEND_HOST,
      user._id,
      redis,
    );
    //save to notification
    await createBulkEmailNotification([
      {
        user_id: user._id,
        recipient: user.email,
        subject: forgotPasswordEmailTemplate.subject,
        body: forgotPasswordEmailTemplate.content,
        data: {
          url,
          linkText: "Reset Password",
        },
        schedule: "emergency",
      },
    ]);
    //send email
    await sendEmailNotification();

    return res.json({
      message:
        "An Email has been sent to your email address, please check your email address",
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPasswordChange = async (req, res, next) => {
  const { newPassword, key } = req.body;

  try {
    const redisKey = `${forgotPasswordPrefix}${key}`;

    const userId = await redis.get(redisKey);
    if (!userId) {
      throw new BadRequestError("Key has expired");
    }

    const user = await User.findById(userId).select("password");
    user.password = newPassword;

    const updatePromise = user.save();

    const deleteKeyPromise = redis.del(redisKey);

    await Promise.all([updatePromise, deleteKeyPromise]);

    return res.json({
      message: "Password successfully changed",
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (_, res) => {
  sendRefreshToken(res, "");

  return res.json({
    message: "Successfully logged out",
  });
};
