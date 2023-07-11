var express = require("express");
var router = express.Router();
const userModel = require("../../models/userModel");
const betModel = require("../../models/betModel");
const dotenv = require("dotenv");
const shortId = require("short-uuid");
const { body, validationResult, header } = require("express-validator");
const firebase = require("../../firebase.js");
const { default: mongoose } = require("mongoose");

dotenv.config();

/* GET users listing. */
router.post(
  "/createBet",
  header("token").notEmpty().withMessage("Enter a valid token"),
  body("lines")
    .notEmpty()
    .withMessage("enter a non empty value")
    .isArray()
    .withMessage("enter a valid email address"),
  body("drawId").notEmpty().withMessage("Enter a draw id"),
  async function (req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) {
      try {
        const currentUser = await firebase
          .auth()
          .verifyIdToken(req.headers.token);

        const userData = await userModel.findOne({
          uid: { $eq: currentUser.uid },
        });

        const amount =
          req?.body?.lines?.reduce((ac, el) => ac + Number(el.stake), 0) * 100;

        if (amount === 0) {
          res.status(398).json({ status: false });
          return;
        }

        if (userData.balance >= amount) {
          await betModel.create({
            ...req.body,
            userId: userData.uid,
          });
          const updatedBalance = userData.balance - amount;
          console.log("before", userData.balance);
          const result = await userModel.findByIdAndUpdate(
            userData._id,
            { balance: updatedBalance },
            { new: true }
          );
          console.log("after", result.balance);
          res.status(200).json(result);
        } else {
          res.status(399).json({ message: "insufficient funds" });
        }
      } catch (e) {
        console.log("ERr", e);
        res.status(400).send({ error: e });
      }
    } else res.status(400).send({ errors: result.array() });
  }
);
router.get(
  "/",
  header("token").notEmpty().withMessage("Enter a valid token"),
  async function (req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) {
      try {
        const currentUser = await firebase
          .auth()
          .verifyIdToken(req.headers.token);

        const data = await betModel
          .find({ userId: { $eq: currentUser.uid } })
          .sort({ createdAt: -1 })          
          .exec();
        res.status(200).json({ data });
      } catch (e) {
        console.log("ERr", e);
        res.status(400).send({ error: e });
      }
    } else res.status(400).send({ errors: result.array() });
  }
);

router.get("/all", async function (req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      let data = await betModel.find({}).sort({ createdAt: -1 }).exec();

      const ankBets = data
        .filter((el) => el.lines?.find((el) => el.name === "ank"))
        .map((el) => el.lines)
        .map((el) => el.filter((el) => el.name === "ank"))
        .flat(2)
        .map((el) => Number(el.ank));
      const jodiBets = data
        .filter((el) => el.lines?.find((el) => el.name === "jodi"))
        .map((el) => el.lines)
        .map((el) => el.filter((el) => el.name === "jodi"))
        .flat(2)
        .map((el) => Number(el.jodi.reduce((ac, el) => ac + el, "")));
      const singlePannaBets = data
        .filter((el) => el.lines?.find((el) => el.name === "single-panna"))
        .map((el) => el.lines)
        .map((el) => el.filter((el) => el.name === "single-panna"))
        .flat(2)
        .map((el) => el.numbers.reduce((ac, el) => ac + el, ""));
      const doublePannaBets = data
        .filter((el) => el.lines?.find((el) => el.name === "double-panna"))
        .map((el) => el.lines)
        .map((el) => el.filter((el) => el.name === "double-panna"))
        .flat(2)
        .map((el) => el.numbers.reduce((ac, el) => ac + el, ""));
      const triplePannaBets = data
        .filter((el) => el.lines?.find((el) => el.name === "triple-panna"))
        .map((el) => el.lines)
        .map((el) => el.filter((el) => el.name === "triple-panna"))
        .flat(2)
        .map((el) => el.numbers.reduce((ac, el) => ac + el, ""));
      const halfSangam = data
        .filter((el) => el.lines?.find((el) => el.name === "half-sangam"))
        .map((el) => el.lines)
        .map((el) => el.filter((el) => el.name === "half-sangam"))
        .flat(2)
        .map((el) => el.numbers.reduce((ac, el) => ac + el, ""));
      const fullSangamBets = data
        .filter((el) => el.lines?.find((el) => el.name === "full-sangam"))
        .map((el) => el.lines)
        .map((el) => el.filter((el) => el.name === "full-sangam"))
        .flat(2)
        .map((el) => [
          el.openNumbers.reduce((ac, el) => ac + el, ""),
          el.closeNumbers.reduce((ac, el) => ac + el, ""),
        ]);

      const array = new Array(100).fill(0);

      jodiBets.forEach((el, index) => {
        const prev = array[el];
        const current = prev + 1;
        array[el] = current;
      });

      const ankArr = new Array(10).fill(0);

      ankBets.forEach((el, index) => {
        const prev = ankArr[el];
        const current = prev + 1;
        ankArr[el] = current;
      });

      const jodiMap=getMap(array);
      const ankMap=getMap(ankArr);

      res.status(200).json({
        ankMap,
        jodiMap,
        singlePannaBets,
        doublePannaBets,
        triplePannaBets,
        halfSangam,
        fullSangamBets, 
      });
    } catch (e) {
      console.log("ERr", e);
      res.status(400).send({ error: e });
    }
  } else res.status(400).send({ errors: result.array() });
});

function getMap(array) {
  const map = {};
  array.forEach((el, index) => {
    map[index] = el;
  });
  return map;
}
module.exports = router;
