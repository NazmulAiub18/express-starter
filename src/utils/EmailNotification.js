const ejs = require("ejs");

const Notification = require("../models/Notification");
const logger = require("../libs/logger");
const { sendEmail } = require("../libs/sendEmail");

const multiDocSender = async (notificationDocs, count, max) => {
  if (!max) {
    max = process.env.PER_CRON_JOB_SEND_NOTIFICATION;
  }
  for (let i = 0; i < notificationDocs.length; i++) {
    if (count >= max) {
      break;
    }

    try {
      const recipient = notificationDocs[i].recipient;
      const subject = notificationDocs[i].subject;
      const content = notificationDocs[i].content;

      await sendEmail(recipient, subject, content);
      notificationDocs[i].status = "Success";
      notificationDocs[i].notes.push({
        status: notificationDocs[i].status,
        process_time: new Date(),
        message: "Successfully Sent!",
      });
      notificationDocs[i].process_date = Date.now();
      count++;
    } catch (err) {
      logger.error("Error in multiDocSender --> ", err);
      notificationDocs[i].status = "Failed";
      notificationDocs[i].notes.push({
        status: notificationDocs[i].status,
        process_time: new Date(),
        message: err.message,
      });
    }
    notificationDocs[i]
      .save()
      .then((_) => {
        logger.info("Notification updated!");
      })
      .catch((e) => {
        logger.error("Notification update failed --> ", e);
      });
  }
  return count;
};

exports.createBulkEmailNotification = async (notificationObjectArray) => {
  //create content
  let modNotificationObjectArray = [];
  for (let i = 0; i < notificationObjectArray.length; i++) {
    const {
      user_id,
      recipient,
      subject,
      body,
      data,
      schedule,
    } = notificationObjectArray[i];
    const content = await ejs.render(
      `<!DOCTYPE html>
      <html>
        <body>
          <h1>I am Header</h1>
          ${body}
          <h1>I am Footer</h1>
        </body>
      </html>`,
      data,
    );
    const notification = {
      user_id,
      recipient,
      subject,
      content,
      type: "email",
      schedule,
    };
    modNotificationObjectArray.push(notification);
  }

  return Notification.insertMany(modNotificationObjectArray);
};

exports.sendEmailNotification = async () => {
  try {
    let count = 0;

    const failedDocsExists = await Notification.exists({
      status: "Failed",
    });
    if (failedDocsExists) {
      const failedDocs = await Notification.find({
        status: "Failed",
      });
      count = await multiDocSender(failedDocs, count);
      logger.info(`Number of Failed Notification Sent: ${count}`);
    }

    if (count < process.env.PER_CRON_JOB_SEND_NOTIFICATION) {
      const pendingDocsExists = await Notification.exists({
        status: "Pending",
      });
      if (pendingDocsExists) {
        const pendingEmergDocs = await Notification.find({
          status: "Pending",
          schedule: "emergency",
        });
        if (pendingEmergDocs.length > 0) {
          count = await multiDocSender(pendingEmergDocs, count);
          logger.info(
            `Number of Pending Emergency Notification Sent: ${count}`,
          );
        }
        if (count < process.env.PER_CRON_JOB_SEND_NOTIFICATION) {
          const pendingRegDocs = await Notification.find({
            status: "Pending",
            schedule: "regular",
          });
          if (pendingRegDocs.length > 0) {
            count = await multiDocSender(pendingRegDocs, count);
            logger.info(
              `Number of Pending Regular Notification Sent: ${count}`,
            );
          }
          if (count < process.env.PER_CRON_JOB_SEND_NOTIFICATION) {
            const pendingSchDocs = await Notification.find({
              status: "Pending",
              schedule: "scheduled",
            });
            if (pendingSchDocs.length > 0) {
              count = await multiDocSender(pendingSchDocs, count);
              logger.info(
                `Number of Pending Scheduled Notification Sent: ${count}`,
              );
            }
          }
        }
      }
    }
    logger.info(`Total ${count} Email Sent!`);
    return;
  } catch (err) {
    logger.error("Error from sendEmailNotification method -> ", err);
    return;
  }
};
