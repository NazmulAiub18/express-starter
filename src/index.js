const mongoose = require("mongoose");
mongoose.set("debug", true);

const app = require("./app");

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MongoDB Connected!");
    return app.listen({ port });
  })
  .then(() => console.log(`Server Started at http://localhost:${port}`))
  .catch((err) => {
    console.error(err);
  });
