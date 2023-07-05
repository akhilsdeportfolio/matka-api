var express = require("express");
var router = express.Router();
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const transactionModel = require("../../models/transactionModel");
const { body, header, validationResult } = require("express-validator");
const firebase = require("../../firebase");
const userModel = require("../../models/userModel");
const { UserInfo } = require("paytm-pg-node-sdk");

dotenv.config();

var instance = new Razorpay({
  key_id: process.env.RPAY_KEY,
  key_secret: process.env.SECRET,
});



router.post(
  "/init",
  body("amount").notEmpty().withMessage("please enter valid amount"),
  header("token").notEmpty().withMessage("enter a valid user token"),  
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      try {
        
        const verify=await firebase.auth().verifyIdToken(req.headers.token);  
        const userInfo= await userModel.findOne({uid:{$eq:verify.uid}}).exec();
        const order = await instance.orders.create({
          amount: req.body.amount,
          currency: "INR",
        });
        var data = await transactionModel.create({         
          userData:userInfo._id, 
          paymentInfo: order,
          amount: req.body.amount,
          uid:userInfo.uid
        });        
        res.json({ data });
      } catch (e) {
        console.error(e);
        res.status(500).send(e);
      }
    } else {
      res.status(400).send({ error: result.array() });
    }
  }
);
router.post("/onSuccesfulTransaction/:tid/:uid", async (req, res) => {
  const transactionId = req.params.tid;


  console.log(req.body);

  const data = await transactionModel.findById(transactionId).exec();
  if (data.status === "closed") {
    res.status(400).json({
      error: "Invalid request",
      status:
        "payment already processed with the same order id create a new order",
    });
  }
  else
  {
    const updated = await transactionModel.findByIdAndUpdate(transactionId, {
        status: "closed",
        paymentInfo: {
          status: "success",
          paymentId: req.body.razorpay_payment_id || null,
          orderId: req.body.razorpay_order_id || null,
          signature: req.body.razorpay_signature || null,
        },
      },{new:true});
      const userData = await userModel.findOne({uid:{$eq:req.params.uid}});
      const transactionData = await transactionModel.findByIdAndUpdate(
        transactionId,
        { isCompleted: true },{new:true}
      );

      const updatedUserData = await userModel.findByIdAndUpdate(
        userData._id,
        { balance: userData.balance + transactionData.amount },
        {new:true}
      );
      res.json({ updated, updatedUserData, transactionData });

  }

  
});
module.exports = router;
