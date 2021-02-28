const nodemailer = require("nodemailer");
const ejs = require("ejs");

const logger = require("./logger");

const getTransporter = () => {
  if (process.env.NODE_ENV === "development") {
    return new Promise((res, rej) => {
      nodemailer.createTestAccount((err1, account) => {
        if (err1) {
          logger.error(
            "Failed to get test account to setup mailer transport --> ",
            err1,
          );
          rej(err1);
        } else {
          const transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
              user: account.user,
              pass: account.pass,
            },
          });
          res(transporter);
        }
      });
    });
  } else {
    return new Promise((res, _) => {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      res(transporter);
    });
  }
};

exports.sendEmail = async (recipient, subject, content) => {
  const message = {
    from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject,
    html: content,
  };

  const mailer = await getTransporter();

  return new Promise((res, rej) => {
    mailer.sendMail(message, (err, info) => {
      if (err) {
        rej(err);
      } else {
        logger.info(`Email Sent to --> ${message.to}!`);
        // Preview only available when sending through an Ethereal account
        if (process.env.NODE_ENV === "development") {
          logger.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        res(info);
      }
    });
  });
};
