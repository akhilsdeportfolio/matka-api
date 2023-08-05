const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: { type: String,required:true},
  lines: [{ type: Object ,required:true}],
  draws: [{ type: mongoose.Schema.Types.ObjectId, ref: "draws" ,required:false}],
  drawId:{ type: mongoose.Schema.Types.ObjectId, ref: "draws" ,required:true},
  id: { type: mongoose.Types.ObjectId },  
  amount: { type: Number, required:false},
  transactionId: { type: mongoose.Schema.Types.ObjectId,ref:"transaction"},
  status: { type: String, default: "OPEN" },
  price: { type: mongoose.Types.Decimal128 },
  drawType: [{ type: String }],
  winnings: [{ type: mongoose.Schema.Types.Object}],
  winningsDivison: [{ type: mongoose.Schema.Types.Object}],  
  shortId: { type: String, ref: "draws" },
  winningsTransactionId:{type:mongoose.Schema.Types.ObjectId,ref:"transaction"},
  winningsTransfered:{type:Boolean,default:false}
},{timestamps:true,});

module.exports = new mongoose.model("bet", betSchema);
