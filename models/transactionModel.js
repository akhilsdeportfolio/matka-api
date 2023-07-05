const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
        transactionId:{type:mongoose.Schema.Types.ObjectId},
        uid:{type:String},
        status:{type:String,default:"in-process"},
        type:{type:String,default:"deposit"},
        amount:{type:Number,default:100},
        meta:{type:Object},
        userData:{type:mongoose.Schema.Types.ObjectId,ref:'users'},
        paymentInfo:{type:Object},
        isCompleted:{type:Boolean,default:false}
},{timestamps:true})

module.exports = mongoose.model("transaction",transactionSchema);
