var express = require("express");
var router = express.Router();
const moment = require("moment");
const data = require("../../finalData.json");
const drawModel = require("../../models/drawModel");
const betsModel = require("../../models/betModel");
const userModel = require("../../models/userModel");
const { header, body, validationResult } = require("express-validator");
const firebase = require("../../firebase");


function getAmount(lines) {
  return lines.reduce((ac, el) => ac + Number(el.stake), 0) * 100;
}

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
    const closetimeExpire = moment().diff(moment.unix(el.closeDrawTime));
    return timeToExpire < 0 || closetimeExpire < 0;
  });
  res.status(200).json({
    status: true,
    totalGames: data.length,
    availableForPlay: playable.length,
    games: playable,
  });
});


router.post("/updateGameResults/open", header("token").notEmpty().withMessage("token is required"), body("drawId").notEmpty().withMessage("Draw Id is required"), body("openNumbers").notEmpty().withMessage("Enter open draw results"), async function (req, res) {

  const result = await validationResult(req);

  if (result.isEmpty()) {
    try {
      const verify = await firebase.auth().verifyIdToken(req.headers.token);
      const data = await drawModel.findOneAndUpdate({ drawId: { $eq: req.body.drawId } }, { openNumbers: req.body.openNumbers, openDrawStatus: "CLOSED" }, { new: true });
      res.status(200).json({ updated: data });
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  } else {
    res.status(400).send({ error: result.array() });
  }
});



router.get("/getWinners/:id", async function (req, res) {
  const draw = await drawModel.findOne({ _id: { $eq: req.params.id } });
  const data = await betsModel.find({});//{ drawId: { $eq: req.params.id } }
  console.log("Total bets", data.length);
  const gamesResultData = { openAnk: (draw.openNumbers.reduce((ac, el) => ac + Number(el), 0) % 10), closeAnk: (draw.closeNumbers.reduce((ac, el) => ac + Number(el), 0) % 10), jodi: Number((draw.openNumbers.reduce((ac, el) => ac + Number(el), 0) % 10) + '' + (draw.closeNumbers.reduce((ac, el) => ac + Number(el), 0) % 10)), open: Number(draw.openNumbers.reduce((ac, el) => ac + el, "")), close: Number(draw.closeNumbers.reduce((ac, el) => ac + el, "")), halfSanagamOpen: Number([...draw.openNumbers, draw.openNumbers.reduce((ac, el) => ac + el, 0) % 10].reduce((ac, el) => ac + el, "")), halfSangamClose: Number([...draw.closeNumbers, draw.closeNumbers.reduce((ac, el) => ac + el, 0) % 10].reduce((ac, el) => ac + el, "")), fullsangam: Number([...draw.openNumbers, ...draw.closeNumbers].reduce((ac, el) => ac + el, "")) };

  // get all ank bets 

  data.forEach(async (bet) => {
    // get lines of each bet
    const lines = bet.lines;
    const winnings = [];

    lines.forEach((line) => {

      switch (line.name) {
        case "ank":
          const userSelected = Number(line.ank.reduce((ac, el) => ac + el));
          if (line.drawType === "open" && gamesResultData.openAnk === userSelected) {
            const winningLine = { ...line, stake: line.stake * 9 };
            winnings.push(winningLine);
          }
          else if (line.drawType === "close" && gamesResultData.closeAnk === userSelected) {
            const winningLine = { ...line, stake: line.stake * 9 };
            winnings.push(winningLine);
          }
          else {
            const winningLine = { ...line, stake: 0 };
            winnings.push(winningLine);
          }

          break;
        case "jodi":
          const sJodi = Number(line.jodi.reduce((ac, el) => ac + el));

          if (gamesResultData.jodi === sJodi) {
            const winningLine = { ...line, stake: line.stake * 95 };
            winnings.push(winningLine);
          }
          else {
            const winningLine = { ...line, stake: 0 };
            winnings.push(winningLine);
          }
          break;
        case "single-panna":
          const singlPannaSelected = Number(line.numbers.reduce((ac, el) => ac + el));
          if (line.drawType === "open" && gamesResultData.open === singlPannaSelected) {
            const winningLine = { ...line, stake: line.stake * 150 };
            winnings.push(winningLine);
          }
          else if (line.drawType === "close" && gamesResultData.close === singlPannaSelected) {
            const winningLine = { ...line, stake: line.stake * 150 };
            winnings.push(winningLine);
          }
          else {
            const winningLine = { ...line, stake: 0 };
            winnings.push(winningLine);
          }

          break;
        case "double-panna":
          const doublePannaSelected = Number(line.numbers.reduce((ac, el) => ac + el));
          if (line.drawType === "open" && gamesResultData.open === doublePannaSelected) {
            const winningLine = { ...line, stake: line.stake * 300 };
            winnings.push(winningLine);
          }
          else if (line.drawType === "close" && gamesResultData.close === doublePannaSelected) {
            const winningLine = { ...line, stake: line.stake * 300 };
            winnings.push(winningLine);
          }
          else {
            const winningLine = { ...line, stake: 0 };
            winnings.push(winningLine);
          }
          break;
        case "triple-panna":
          const triplePannaSelected = Number(line.numbers.reduce((ac, el) => ac + el));
          if (line.drawType === "open" && gamesResultData.open === triplePannaSelected) {
            const winningLine = { ...line, stake: line.stake * 600 };
            winnings.push(winningLine);
          }
          else if (line.drawType === "close" && gamesResultData.close === triplePannaSelected) {
            const winningLine = { ...line, stake: line.stake * 600 };
            winnings.push(winningLine);
          }
          else {
            const winningLine = { ...line, stake: 0 };
            winnings.push(winningLine);
          }
          break;
        case "half-sangam":
          const panna = Number(line.numbers.reduce((ac, el) => ac + el));
          const number = Number(line.ank.reduce((ac, el) => ac + el));

          if (line.drawType === "open" && Math.ceil(gamesResultData.halfSanagamOpen / 10) === panna && (gamesResultData.halfSanagamOpen % 10) === number) {
            const winningLine = { ...line, stake: line.stake * 5000 };
            winnings.push(winningLine);
          }
          else if (line.drawType === "close" && Math.ceil(gamesResultData.halfSangamClose / 10) === panna && (gamesResultData.halfSangamClose % 10) === number) {
            const winningLine = { ...line, stake: line.stake * 5000 };
            winnings.push(winningLine);
          }
          else {
            const winningLine = { ...line, stake: 0 };
            winnings.push(winningLine);
          }
          break;
        case "full-sangam":
          const full = Number(line.openNumbers.reduce((ac, el) => ac + el) + "" + line.closeNumbers.reduce((ac, el) => ac + el));
          if (gamesResultData.fullsangam === full) {
            const winningLine = { ...line, stake: line.stake * 10000 };
            winnings.push(winningLine);
          }
          else {
            const winningLine = { ...line, stake: 0 };
            winnings.push(winningLine);
          }
          break;
        default:
          break;
      }
    })
    const updated = await betsModel.findOneAndUpdate({ _id: { $eq: bet._id } }, { winningsDivison: winnings, status: 'Close' }, { new: true }).lean().exec();
    if (!updated.winningsTransfered) {
      const userData = await userModel.findOne({ uid: bet.userId }).lean().exec();
      await userModel.findOneAndUpdate({ uid: bet.userId, balance: userData.balance + getAmount(winnings) }).lean().exec();
      console.log("Transfered");
      await betsModel.findOneAndUpdate({ _id: { $eq: bet._id } }, { winningsTransfered: true, status: 'Close' }).lean().exec();
      console.log("Updated in DB");
    }
  });



  res.json({ gamesResultData })
});


router.post("/updateGameResults/close", header("token").notEmpty().withMessage("token is required"), body("drawId").notEmpty().withMessage("Draw Id is required"), body("closeNumbers").notEmpty().withMessage("Enter close draw results"), async (req, res) => {

  const result = await validationResult(req);

  if (result.isEmpty()) {
    try {
      const verify = await firebase.auth().verifyIdToken(req.headers.token);
      const data = await drawModel.findOneAndUpdate({ drawId: { $eq: req.body.drawId } }, { closeNumbers: req.body.closeNumbers, closeDrawStatus: "CLOSED" }, { new: true });
      res.status(200).json({ updated: data });
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  } else {
    res.status(400).send({ error: result.array() });
  }


});

router.post(
  "/getGameResults",
  header("token").notEmpty().withMessage("token is required"),
  body("date").notEmpty().withMessage("Date is required"),
  async function (req, res) {
    const result = await validationResult(req);

    if (result.isEmpty()) {
      try {
        const verify = await firebase.auth().verifyIdToken(req.headers.token);
        const data = await drawModel
          .find({
            date: { $eq: req.body.date },
          }).sort({ openDrawTime: 1 })
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
