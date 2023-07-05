const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId,required:true},
  additionalBets: [{ type: Object ,required:true}],
  draws: [{ type: mongoose.Schema.Types.ObjectId, ref: "draws" ,required:true}],
  id: { type: mongoose.Types.ObjectId },
  productId: { type: String,required:true},
  productName: { type: String ,required:true},
  amount: { type: Number, required:true},
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  transactionId: { type: mongoose.Schema.Types.ObjectId,ref:"transaction"},
  status: { type: String, default: "OPEN" },
  price: { type: mongoose.Types.Decimal128 },
  drawType: [{ type: String }],
  winnings: { type: Number, deafult: 0 },
  winningsDivison: [{ type: mongoose.Schema.Types.ObjectId, ref: "winnings" }],
  drawId: { type: String, ref: "draws" },
  shortId: { type: String, ref: "draws" },
  winningsTransactionId:{type:mongoose.Schema.Types.ObjectId,ref:"transaction"},
  winningsTransfered:{type:Boolean,default:false}
},{timestamps:true,});

module.exports = new mongoose.model("bet", betSchema);
