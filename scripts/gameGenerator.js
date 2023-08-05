const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const short = require("short-uuid");
const fs = require("fs");

const data = [
  {
    "sno": 2,
    "start-time": "09:50",
    "product-name": "Karnataka Day",
    "product-id": "KARDAY",
    "slot": "open",
    "open-draw-time": "09:50",
    "close-draw-time": "10:50"
  },
  {
    "sno": 3,
    "start-time": "11:37",
    "product-name": "Sridevi",
    "product-id": "SRIDAY",
    "slot": "open",
    "open-draw-time": "11:37",
    "close-draw-time": "12:37:00"
  },
  {
    "sno": 4,
    "start-time": "13:03",
    "product-name": "Time Bazar",
    "product-id": "TIMEBAZ",
    "slot": "open",
    "open-draw-time": "13:03",
    "close-draw-time": "14:03"
  },
  {
    "sno": 5,
    "start-time": "13:30",
    "product-name": "Madhur Day",
    "product-id": "MADDAY",
    "slot": "open",
    "open-draw-time": "13:30",
    "close-draw-time": "14:30"
  },
  {
    "sno": 6,
    "start-time": "15:05",
    "product-name": "Milan Day",
    "product-id": "MILDAY",
    "slot": "open",
    "open-draw-time": "15:05",
    "close-draw-time": "17:05"
  },
  {
    "sno": 7,
    "start-time": "15:05",
    "product-name": "Rajadhani Day",
    "product-id": "RAJDAY",
    "slot": "open",
    "open-draw-time": "15:05",
    "close-draw-time": "17:05"
  },
  {
    "sno": 8,
    "start-time": "16:18",
    "product-name": "Kalyan",
    "product-id": "KALYAN",
    "slot": "open",
    "open-draw-time": "16:18",
    "close-draw-time": "18:18"
  },
  {
    "sno": 9,
    "start-time": "18:20",
    "product-name": "Karnataka Night",
    "product-id": "KARNYT",
    "slot": "open",
    "open-draw-time": "18:20",
    "close-draw-time": "19:20"
  },
  {
    "sno": 10,
    "start-time": "20:25",
    "product-name": "Madhur Night",
    "product-id": "MADNYT",
    "slot": "open",
    "open-draw-time": "20:25",
    "close-draw-time": "22:25"
  },
  {
    "sno": 11,
    "start-time": "20:55",
    "product-name": "Milan Night",
    "product-id": "MILNYT",
    "slot": "open",
    "open-draw-time": "20:55",
    "close-draw-time": "23:00"
  },
  {
    "sno": 12,
    "start-time": "21:25",
    "product-name": "Rajadhani Night",
    "product-id": "RAJNYT",
    "slot": "open",
    "open-draw-time": "21:25",
    "close-draw-time": "23:35"
  },
  {
    "sno": 13,
    "start-time": "09:35",
    "product-name": "Main Bazar",
    "product-id": "MAINBAZ",
    "slot": "open",
    "open-draw-time": "09:35",
    "close-draw-time": "11:55"
  },
  {
    "sno": 14,
    "start-time": "21:00",
    "product-name": "Kalyan Night",
    "product-id": "KALNYT",
    "slot": "open",
    "open-draw-time": "21:00",
    "close-draw-time": "23:00"
  },
  {
    "sno": 15,
    "start-time": "21:50",
    "product-name": "Main Ratan",
    "product-id": "MAINRAT",
    "slot": "open",
    "open-draw-time": "21:50",
    "close-draw-time": "23:55"
  },
  {
    "sno": 16,
    "start-time": "11:00",
    "product-name": "Main Ratain Morning",
    "product-id": "MAINRATDAY",
    "slot": "open",
    "open-draw-time": "11:00",
    "close-draw-time": "12:00"
  },
  {
    "sno": 17,
    "start-time": "11:20",
    "product-name": "Mahadev Morning",
    "product-id": "",
    "slot": "open",
    "open-draw-time": "11:20",
    "close-draw-time": "12:20"
  },
  {
    "sno": 18,
    "start-time": "15:35",
    "product-name": "Mahadev Day",
    "product-id": "",
    "slot": "open",
    "open-draw-time": "15:35",
    "close-draw-time": "17:35"
  },
  {
    "sno": 19,
    "start-time": "19:50",
    "product-name": "Mahadev Night",
    "product-id": "",
    "slot": "open",
    "open-draw-time": "19:50",
    "close-draw-time": "20:50"
  },
  {
    "sno": 20,
    "start-time": "19:00",
    "product-name": "Sridevi Night",
    "product-id": "SRINYT",
    "slot": "open",
    "open-draw-time": "19:00",
    "close-draw-time": "20:00"
  }
];


let ans = [];

for (let i = 0; i < 365 * 2; i++) {
  console.log("Generating::::::::", i);
  const req = data.map((el) => {
    const ostart = el["open-draw-time"].split(":")[0];
    const oend = el["open-draw-time"].split(":")[1];
    const cstart = el["close-draw-time"].split(":")[0];
    const cend = el["close-draw-time"].split(":")[1];
    const timeToExpire = moment().diff(
      moment({ hours: ostart, minutes: oend, seconds: 00 }).add(i, "d")
    );

    const timeToClose = moment().diff(
      moment({ hours: cstart, minutes: cend, seconds: 00 }).add(i, "d")
    );

    return {
      productName: el["product-name"],
      productId: el["product-id"],
      drawId: uuidv4(),
      shortId: short.generate(),
      date: moment({ hours: 00, minutes: 00, seconds: 00 })
        .add(i, "d")
        .format("DD-MM-YYYY"),
      openDrawTime: moment({ hours: ostart, minutes: oend, seconds: 00 })
        .add(i, "d")
        .unix(),
      closeDrawTime: moment({ hours: cstart, minutes: cend, seconds: 00 })
        .add(i, "d")
        .unix(),
      openNumbers: [],
      closeNumbers: [],
      slot: ["OPEN", "CLOSE"],
      openDrawStatus: timeToExpire < 0 ? "TO_BE_DRAWN" : "DRAW_IN_PROGESS",
      closeDrawStatus: timeToClose < 0 ? "TO_BE_DRAWN" : "DRAW_IN_PROGESS",
      createdAt: moment(new Date()).unix(),
      updatedAt: moment(new Date()).unix(),
      createdBy: "SYSTEM",
    };
  });

  ans = [...ans, ...req];
}

fs.writeFileSync("finalData.json", JSON.stringify(ans), "utf-8", (err) => {
  if (err) throw err;
  console.log("Data added to file");
});
