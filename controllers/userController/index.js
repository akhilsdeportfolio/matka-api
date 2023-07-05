var express = require("express");
var router = express.Router();
const userModel = require("../../models/userModel");
const dotenv = require("dotenv");
const shortId = require("short-uuid");
const { body, validationResult } = require("express-validator");
const firebase = require("../../firebase.js");
const { default: mongoose } = require("mongoose");

dotenv.config();

/* GET users listing. */
router.post(
  "/signUp",
  body("email")
    .notEmpty()
    .withMessage("enter a non empty value")
    .isEmail()
    .withMessage("enter a valid email address"),
  body("password").notEmpty(),
  async function (req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) {
      try {
        const user = await firebase
          .auth()
          .createUser({ email: req.body.email, password: req.body.password });
        const userData = await userModel.create({ ...user,uid:user.uid, balance: 0 });

        res.json({ userData });
      } catch (e) {
        res.status(400).send({ error: e });
      }
    } else res.status(400).send({ errors: result.array() });
  }
);
module.exports = router;
