const { model, Schema } = require("mongoose");

const emailTemplateSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Email template name must not be empty"],
    },
    subject: {
      type: String,
      required: [true, "Email template subject must not be empty"],
    },
    content: {
      type: String,
      required: [true, "Email template content must not be empty"],
    },
    variables: [
      {
        type: String,
        required: [true, "Email template variables can not be empty"],
      },
    ],
    status: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const EmailTemplate = model("EmailTemplate", emailTemplateSchema);

module.exports = EmailTemplate;
