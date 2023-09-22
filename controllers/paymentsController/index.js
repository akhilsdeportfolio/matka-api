var express = require("express");
var router = express.Router();
const dotenv = require("dotenv");
const transactionModel = require("../../models/transactionModel");
const { body, header, validationResult } = require("express-validator");
const firebase = require("../../firebase");
const userModel = require("../../models/userModel");
const moment = require("moment");
const axios = require("axios");
var bcrypt = require("bcryptjs");
const sha256 = require("sha256");
const { decode } = require("jsonwebtoken");

dotenv.config();



const saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const phonePemerchantId = "PGTESTPAYUAT";

router.post("/all", header("token").notEmpty().withMessage("Please enter a token"), async (req, res) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    const userData = await firebase.auth().verifyIdToken(req.headers.token);
    const result = await transactionModel.find({ uid: userData.uid }).sort({ createdAt: -1 }).lean().exec()
    res.status(200).json({ data: result })
  }
  else {
    res.status(400).json(result.array());
  }
});
router.post("/withdraw", header("token").notEmpty().withMessage("Please enter a token"), async (req, res) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    const userData = await firebase.auth().verifyIdToken(req.headers.token);
    const result = await transactionModel.create({ uid: userData.uid, bankDetails: req.body, amount: (req.body.amount * 100), type: 'withdraw' });
    const prevUserData = await userModel.findOne({ uid: userData.uid });


    if (prevUserData.balance <= 0) {
      res.status(399).json({ error: 'insufficient funds' });
      return;
    }


    if (prevUserData.balance < (req.body.amount * 100)) {
      res.status(399).json({ error: 'insufficient funds' });
      return;
    }
    else {
      const newUserData = await userModel.findOneAndUpdate({ uid: userData.uid, balance: prevUserData.balance - (Number(req.body.amount) * 100) });
      res.status(200).json(newUserData);
      return;
    }

  }
  else {
    res.status(400).json(result.array());
  }
});




router.get(
  "/phonepe/status/:transactionId",
  header("token").notEmpty().withMessage("enter a valid user token"),
  async (req, apiResponse) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      try {
        const userData = await firebase.auth().verifyIdToken(req.headers.token);
        const saltIndex = 1;
        let string =
          `/pg/v1/status/${phonePemerchantId}/${req.params.transactionId}` +
          saltKey;
        const sha = sha256(string);

        const config = {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": sha + "###" + saltIndex,
            "X-MERCHANT-ID": phonePemerchantId,
          },
        };
        const resp = await axios.get(
          ` https://api-preprod.phonepe.com/apis/hermes/pg/v1/status/${phonePemerchantId}/${req.params.transactionId}`,
          config
        );
        apiResponse.status(200).json(resp.data);
      } catch (e) {
        console.log(e);
        apiResponse.status(500).json({ error: e });
      }
    } else {
      apiResponse.status(400).json({
        status: false,
        message: "Client error",
        error: result.array(),
      });
    }
  }
);

router.post(
  "/init/PhonePe",
  body("amount").notEmpty().withMessage("please enter valid amount"),
  header("token").notEmpty().withMessage("enter a valid user token"),
  async (req, apiResponse) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      try {
        const verify = await firebase.auth().verifyIdToken(req.headers.token);
        const userInfo = await userModel
          .findOne({ uid: { $eq: verify.uid } })
          .exec();

        const order = await instance.orders.create({
          amount: req.body.amount,
          currency: "INR",
        });

        var transactionData = await transactionModel.create({
          userData: userInfo._id,
          paymentInfo: order,
          amount: req.body.amount,
          uid: userInfo.uid,
        });

        const samplePayload = {
          merchantId: phonePemerchantId,
          merchantTransactionId: transactionData._id,
          merchantUserId: userInfo.uid,
          amount: req.body.amount || 100,
          redirectUrl: `https://payments.mhprop.solutions/transaction/status/${transactionData._id}`,
          redirectMode: "GET",
          callbackUrl: `https://hyper-local-vegitables.el.r.appspot.com/payments/callback/${transactionData._id}/${userInfo.uid}`,
          mobileNumber: userInfo.mobileNumber,
          paymentInstrument: {
            type: "PAY_PAGE",
          },
        };

        const encoded = await bcrypt.encodeBase64(
          JSON.stringify(samplePayload),
          { asString: true },
          72
        );
        const saltIndex = 1;
        let string = encoded + "/pg/v1/pay" + saltKey;
        const sha = sha256(string);

        const config = {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": sha + "###" + saltIndex,
          },
        };
        const resp = await axios.post(
          " https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay",
          samplePayload,
          config
        );
        apiResponse.status(200).json(resp.data);
      } catch (e) {
        console.log(e);
        apiResponse.status(500).json({ e });
      }
    } else {
      apiResponse.status.json(result.array());
    }
  }
);
router.post(
  "/init/PhonePe/qr",
  body("amount").notEmpty().withMessage("please enter valid amount"),
  header("token").notEmpty().withMessage("enter a valid user token"),
  async (req, apiResponse) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      try {
        const verify = await firebase.auth().verifyIdToken(req.headers.token);
        const userInfo = await userModel
          .findOne({ uid: { $eq: verify.uid } })
          .exec();

        const order = await instance.orders.create({
          amount: req.body.amount,
          currency: "INR",
        });

        var transactionData = await transactionModel.create({
          userData: userInfo._id,
          paymentInfo: order,
          amount: req.body.amount,
          uid: userInfo.uid,
        });

        const samplePayload = {
          merchantId: phonePemerchantId,
          merchantTransactionId: transactionData._id,
          merchantUserId: userInfo.uid,
          amount: req.body.amount || 100,
          redirectUrl: "https://payments.mhprop.solutions/",
          redirectMode: "GET",
          callbackUrl: `https://hyper-local-vegitables.el.r.appspot.com/payments/callback/${transactionData._id}/${userInfo.uid}`,
          mobileNumber: userInfo.mobileNumber,
          paymentInstrument: {
            type: "UPI_QR",
          },
        };

        const encoded = await bcrypt.encodeBase64(
          JSON.stringify(samplePayload),
          { asString: true },
          72
        );
        const saltIndex = 1;
        let string = encoded + "/pg/v1/pay" + saltKey;
        const sha = sha256(string);

        const config = {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": sha + "###" + saltIndex,
          },
        };
        const resp = await axios.post(
          "https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay",
          samplePayload,
          config
        );
        apiResponse.status(200).json(resp.data);
      } catch (e) {
        console.log(e);
        apiResponse.status(500).json({ e });
      }
    } else {
      apiResponse.status.json(result.array());
    }
  }
);
router.post(
  "/init/PhonePe/intent",
  body("amount").notEmpty().withMessage("please enter valid amount"),
  header("token").notEmpty().withMessage("enter a valid user token"),
  async (req, apiResponse) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      try {
        const verify = await firebase.auth().verifyIdToken(req.headers.token);
        const userInfo = await userModel
          .findOne({ uid: { $eq: verify.uid } })
          .exec();

        const order = await instance.orders.create({
          amount: req.body.amount,
          currency: "INR",
        });

        var transactionData = await transactionModel.create({
          userData: userInfo._id,
          paymentInfo: order,
          amount: req.body.amount,
          uid: userInfo.uid,
        });

        const samplePayload = {
          merchantId: phonePemerchantId,
          merchantTransactionId: transactionData._id,
          merchantUserId: userInfo.uid,
          amount: req.body.amount || 100,
          callbackUrl: `https://hyper-local-vegitables.el.r.appspot.com/payments/callback/${transactionData._id}/${userInfo.uid}`,
          mobileNumber: userInfo.mobileNumber,
          deviceContext: {
            "deviceOS": "ANDROID"
          },
          paymentInstrument: {
            type: "UPI_INTENT",
            targetApp: "com.phonepe.app",
          },
        };

        const encoded = await bcrypt.encodeBase64(
          JSON.stringify(samplePayload),
          { asString: true },
          72
        );
        const saltIndex = 1;
        let string = encoded + "/pg/v1/pay" + saltKey;
        const sha = sha256(string);

        const config = {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": sha + "###" + saltIndex,
          },
        };
        const resp = await axios.post(
          " https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay",
          samplePayload,
          config
        );
        apiResponse.status(200).json({ phonePe: resp.data });
      } catch (e) {
        console.log(e);
        apiResponse.status(500).json({ e });
      }
    } else {
      apiResponse.status.json(result.array());
    }
  }
);
router.post(
  "/init/PhonePe/vpaCollect",
  body("amount").notEmpty().withMessage("please enter valid amount"),
  header("token").notEmpty().withMessage("enter a valid user token"),
  async (req, apiResponse) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      try {
        const verify = await firebase.auth().verifyIdToken(req.headers.token);
        const userInfo = await userModel
          .findOne({ uid: { $eq: verify.uid } })
          .exec();

        const order = await instance.orders.create({
          amount: req.body.amount,
          currency: "INR",
        });

        var transactionData = await transactionModel.create({
          userData: userInfo._id,
          paymentInfo: order,
          amount: req.body.amount,
          uid: userInfo.uid,
        });

        const samplePayload = {
          merchantId: phonePemerchantId,
          merchantTransactionId: transactionData._id,
          merchantUserId: userInfo.uid,
          amount: req.body.amount || 100,
          callbackUrl: `https://hyper-local-vegitables.el.r.appspot.com/payments/callback/${transactionData._id}/${userInfo.uid}`,
          mobileNumber: userInfo.mobileNumber,
          paymentInstrument: {
            type: "UPI_COLLECT",
            vpa: "test-vpa@ybl",
            accountConstraints: [
              {
                //Optional. Required only for TPV Flow.
                accountNumber: "420200001892",
                ifsc: "ICIC0000041",
              },
            ],
          },
        };

        const encoded = await bcrypt.encodeBase64(
          JSON.stringify(samplePayload),
          { asString: true },
          72
        );
        const saltIndex = 1;
        let string = encoded + "/pg/v1/pay" + saltKey;
        const sha = sha256(string);

        const config = {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": sha + "###" + saltIndex,
          },
        };
        const resp = await axios.post(
          " https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay",
          samplePayload,
          config
        );
        apiResponse.status(200).json(resp.data);
      } catch (e) {
        console.log(e);
        apiResponse.status(500).json({ e });
      }
    } else {
      apiResponse.status.json(result.array());
    }
  }
);

router.post(
  "/init",
  body("amount").notEmpty().withMessage("please enter valid amount"),
  header("token").notEmpty().withMessage("enter a valid user token"),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      try {
        const verify = await firebase.auth().verifyIdToken(req.headers.token);
        const userInfo = await userModel
          .findOne({ uid: { $eq: verify.uid } })
          .exec();
        const order = await instance.orders.create({
          amount: req.body.amount,
          currency: "INR",
        });
        var data = await transactionModel.create({
          userData: userInfo._id,
          paymentInfo: order,
          amount: req.body.amount,
          uid: userInfo.uid,
        });
        res.status(200).json({ data });
      } catch (e) {
        console.error(e);
        res.status(500).send(e);
      }
    } else {
      res.status(400).send({ error: result.array() });
    }
  }
);

router.post("/createPaymentLink", async (req, res) => {
  try {
    const link = await instance.qrCode.create({
      type: "upi_qr",
      name: "Store Front Display",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: req.body.amount,
      description: "For Store 1",
      close_by: moment().add("1", "d").unix(),
      notes: {
        purpose: "Test UPI QR Code notes",
      },
    });
    res.status(200).json(link);
  } catch (e) {
    res.json({ error: e });
  }
});

router.post("/callback/:tid/:uid", async (req, res) => {
  const encodedResponse = req.body.response;
  const bufferString = Buffer.from(encodedResponse, "base64").toString();
  const parsedResponse = JSON.parse(bufferString);

  console.info("WEB HOOK DATA", parsedResponse);

  if (parsedResponse.code === "PAYMENT_SUCCESS" && parsedResponse.success) {
    const transactionId = req.params.tid;

    const data = await transactionModel.findById(transactionId).exec();
    if (data.status === "success") {
      res.status(400).json({
        error: "Invalid request",
        status:
          "payment already processed with the same order id create a new order",
      });
    } else {
      try {
        const updated = await transactionModel.findByIdAndUpdate(
          transactionId,
          {
            status: "success",
            transactionDateTime: new Date(),
            phonePe: parsedResponse.data,
          },
          { new: true }
        );
        const userData = await userModel.findOne({
          uid: { $eq: req.params.uid },
        });
        const transactionData = await transactionModel.findByIdAndUpdate(
          transactionId,
          { isCompleted: true },
          { new: true }
        );
        const updatedUserData = await userModel.findByIdAndUpdate(
          userData._id,
          { balance: userData.balance + transactionData.amount },
          { new: true }
        );
        res.status(200).json({ newBalance: updatedUserData.balance });
      } catch (e) {
        res.status(500).json({ error: e });
      }
    }
  } else {
    console.error("PAYMENT FAILED", parsedResponse);
    res.status(500).send();
  }
});
module.exports = router;
