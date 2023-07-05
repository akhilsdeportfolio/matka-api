const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id:{type:mongoose.Schema.Types.ObjectId},
    uid: { type: String ,unique:true,required:true},
    email: { type: String ,requried:true},
    status: { type: "string", default: "active" },
    salutation: { type: String ,default:""},
    firstname: { type: String ,default:""},
    lastname: { type: String ,default:""},
    birthdate: { type: String ,default:""},
    language: { type: String ,default:""},
    streetName:{type:String,default:""},
    streetNr:{type:String,default:""},
    postCode:{type:String,default:""},
    city:{type:String,default:""},
    country:{type:String,default:""},
    email:{type:String,default:""},
    password:{type:String},
    mobileNumber:{type:String,default:""},
    countryCode:{type:String,default:"+91"},
    balance:{type:Number,default:0},
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
