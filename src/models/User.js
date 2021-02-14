const bcrypt = require("bcryptjs");
const { model, Schema } = require("mongoose");

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name must not be empty"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email must not be empty"],
      validate: {
        validator: (email) => emailRegex.test(email),
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    password: {
      type: String,
      required: [true, "Password must not be empty"],
      validate: {
        validator: (password) => password.length >= 6,
        message: () => "Password must be at least 6 character long",
      },
    },
    role: {
      type: String,
      required: [true, "Role must not be empty"],
      enum: ["user", "admin"],
    },
    tokenVersion: {
      type: Number,
      required: [true, "TokenVersion must not be empty"],
      default: 0,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.validatePassword = function (data) {
  return bcrypt.compare(data, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = model("User", userSchema);

module.exports = User;
