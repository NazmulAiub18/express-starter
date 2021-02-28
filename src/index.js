const mongoose = require("mongoose");
const logger = require("./libs/logger");

// mongoose.set("debug", true);
mongoose.set("debug", function (coll, method, query, doc, options) {
  const queryStr = JSON.stringify(query);
  const docStr = JSON.stringify(doc);
  const optionsStr = JSON.stringify(options || {});

  logger.debug(`${coll}.${method}(${queryStr}, ${optionsStr}, ${docStr});`);
});

const app = require("./app");

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info("MongoDB Connected!");
    require("./libs/agenda");
    return app.listen({ port });
  })
  .then(() => logger.info(`Server Started at http://localhost:${port}`))
  .catch((err) => {
    logger.error(err);
  });
