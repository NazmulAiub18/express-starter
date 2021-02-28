const { NotFoundError, BadRequestError } = require("../utils/Errors");
const EmailTemplate = require("../models/EmailTemplate");
const slugify = require("../utils/slugify");

const tempNotFound = "Email template not found";
const tempAlreadyExists = "A template with this name already exists";

exports.get = async (req, res, next) => {
  const { id } = req.params;

  try {
    const emailTemplate = await EmailTemplate.findById(id);
    if (!emailTemplate) {
      throw new NotFoundError(tempNotFound);
    }
    return res.json(emailTemplate);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (_, res, next) => {
  try {
    return res.json(await EmailTemplate.find({}));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  const { name, subject, content, variables, status } = req.body;

  try {
    //slugify the name
    const slugifyName = slugify(name, "_");
    //check already exists with this name
    const templateAlreadyExists = await EmailTemplate.exists({
      name: slugifyName,
    });
    if (templateAlreadyExists) {
      throw new BadRequestError(tempAlreadyExists);
    }
    const emailTemplate = await EmailTemplate.create({
      name: slugifyName,
      subject,
      content,
      variables,
      status,
      created_by: req.user._id,
      updated_by: req.user._id,
    });
    return res.json(emailTemplate);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const { id } = req.params;

  try {
    //find the template to update
    const emailTemplate = await EmailTemplate.findById(id);
    if (!emailTemplate) {
      throw new NotFoundError(tempNotFound);
    }
    if (req.body.name) {
      //slugify the name
      req.body.name = slugify(req.body.name, "_");
      //check already exists with this name
      const templateAlreadyExists = await EmailTemplate.exists({
        _id: { $nin: [emailTemplate._id] },
        name: req.body.name,
      });
      if (templateAlreadyExists) {
        throw new BadRequestError(tempAlreadyExists);
      }
    }

    emailTemplate.set(req.body);
    await emailTemplate.save();
    return res.json(emailTemplate);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  const { id } = req.params;

  try {
    await EmailTemplate.deleteOne({ _id: id });
    return res.json({ message: "Email template successfully removed" });
  } catch (err) {
    next(err);
  }
};
