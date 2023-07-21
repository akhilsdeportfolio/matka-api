var express = require("express");
var router = express.Router();
const moment = require("moment");
const data = require("../../finalData.json");
const drawModel = require("../../models/drawModel");
const { header, body, validationResult } = require("express-validator");
const firebase = require("../../firebase");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  const days = Number(req?.query?.days || 0);
  const playDays = [moment().format("DD-MM-YYYY")];
  for (let i = 1; i <= days; i++) {
    playDays.push(moment().add(i, "d").format("DD-MM-YYYY"));
  }
  const data = await drawModel.find({ date: { $in: playDays } }).sort({ openDrawTime: 1 }).exec();
  const playable = data.filter((el) => {
    const timeToExpire = moment().diff(moment.unix(el.openDrawTime));
    return timeToExpire < 0;
  });
  res.status(200).json({
    status: true,
    totalGames: data.length,
    availableForPlay: playable.length,
    games: playable,
  });
});

router.post(
  "/getGameResults",
  header("token").notEmpty().withMessage("token is required"),
  body("game").notEmpty().withMessage("Game name is required"),
  body("date").notEmpty().withMessage("Date is required"),
  async function (req, res) {
    const result = await validationResult(req);

    if (result.isEmpty()) {
      try {
        const verify = await firebase.auth().verifyIdToken(req.headers.token);
        const data = await drawModel
          .find({
            date: { $eq: req.body.date },
            productName: { $eq: req.body.game },
          })
          .exec();
        res.status(200).json({ games: data });
      } catch (e) {
        console.error(e);
        res.status(500).send(e);
      }
    } else {
      res.status(400).send({ error: result.array() });
    }
  }
);

router.get("/createDrawData", async (req, res) => {
  await data.forEach(async (element) => {
    await drawModel.create({ ...element });
  });

  res.send("Created Succesfully");
});

router.get("/:id", function (req, res, next) {
  const filtered = data.filter((el, i) => {
    if (i === 0) console.log(el);
    if (el.shortId === req.params.id || el.drawId === req.params.id)
      return true;
  });
  res.json({ status: true, data: filtered });
});

module.exports = router;
