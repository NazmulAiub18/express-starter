const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const api = require("./routes");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.locals.BACKEND_HOST = req.protocol + "://" + req.get("host");
  return next();
});

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
