const Agenda = require("agenda");

const logger = require("./logger");
const { agendaTimer } = require("../constants");

const agendaFns = require("../utils/agendaFns");

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB,
    collection: "agendaJobs",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  processEvery: agendaTimer || "5 seconds",
});

agenda.on("fail", function (err, job) {
  return logger.error("Job failed with error --> ", err);
});

for (let i = 0; i < agendaFns.length; i++) {
  const { name, fn } = agendaFns[i];

  agenda.define(name, async function (job, done) {
    logger.warn(`Running '${name}' process...`);
    try {
      await fn(job);
      return done();
    } catch (error) {
      logger.error(`Job running exception from --> ${name}!`, error);
      return done(error);
    }
  });
}

/**
 * Starting agenda
 */
agenda.on("ready", function () {
  if (process.env.NODE_ENV === "development") return;

  for (let i = 0; i < agendaFns.length; i++) {
    const { name, interval } = agendaFns[i];
    agenda.every(interval, name);
  }
  agenda.start();
  logger.info("Agenda started!");
});

module.exports = agenda;
