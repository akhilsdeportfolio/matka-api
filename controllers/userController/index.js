var express = require("express");
var router = express.Router();
const userModel = require("../../models/userModel");
const dotenv = require("dotenv");
const { body, validationResult, header } = require("express-validator");
const firebase = require("../../firebase.js");
const { default: mongoose } = require("mongoose");

dotenv.config();

/* GET users listing. */

router.post(
  "/addPhone",
  header("token").notEmpty().withMessage("enter a token"),
  body("email")
    .notEmpty()
    .withMessage("enter a non empty value")
    .isEmail()
    .withMessage("enter a valid email address"),
  body("mobile")
    .notEmpty()
    .withMessage("enter a non empty value")
    .isMobilePhone()    
    .withMessage("enter a valid phone number"),
  body("password").notEmpty(),
  async function (req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) {
      try {
        const user = await firebase
          .auth()
          .verifyIdToken(req.headers.token)
        
        const result=await firebase.auth().updateUser(user.uid,{phoneNumber:"+91"+req.body.mobile})
        res.status(200).json({ result });
      } catch (e) {
        console.log(e);
        res.status(400).send({ error: e });
      }
    } else res.status(400).send({ errors: result.array() });
  }
);
router.get('/users/:uid',async (req,res)=>{ 
    const userData=await userModel.findOne({uid:{$eq:req.params.uid}}).exec();
    res.json({userData});
})


module.exports = router;
