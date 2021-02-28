const { createLogger, format, transports } = require("winston");
const { combine, splat, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (metadata) {
    const metadataStr = JSON.stringify(metadata);
    if (metadataStr !== "{}") msg += metadataStr;
  }
  return msg;
});

const logger = createLogger({
  level: "debug",
  format: combine(
    format.colorize(),
    splat(),
    timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    myFormat,
  ),
  transports: [new transports.Console({ level: "debug" })],
});
module.exports = logger;
