const { Router } = require("express");

//controllers
const {
  get,
  getAll,
  create,
  update,
  remove,
} = require("../controllers/emailTemplateController");

//middlewares
const validate = require("../middlewares/validate");
const permission = require("../middlewares/permission");
const { ROLE } = require("../utils/Roles");

//validationSchemas
const {
  createSchema,
  updateSchema,
} = require("../validationSchemas/emailTemplateSchemas");
const EmailTemplate = require("../models/EmailTemplate");

const router = Router();

router.all("*", permission([ROLE.ADMIN]));
router.get("/get/:id", get);
router.get("/getAll", getAll);
router.post("/create", validate(createSchema), create);
router.put("/update/:id", validate(updateSchema), update);
router.delete("/remove/:id", remove);
router.get("/test", async (req, res) => {
  const newtem = await EmailTemplate.create({
    name: "forgot_password",
    subject: "Reset Your Password",
    content: `
      <p>Testing In <b>Dev</b> Mode - the world's most awesomest email service!</p>
      <a href="<%= url %>"><%= linkText %></a>
    `,
    variables: ["url", "linkText"],
    created_by: "602cfd7a6fe3262ae02e61c8",
    updated_by: "602cfd7a6fe3262ae02e61c8",
  });
  res.json(newtem);
});

module.exports = router;
