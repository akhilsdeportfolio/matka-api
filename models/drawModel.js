const mongoose = require("mongoose");


const drawSchema = new mongoose.Schema({
    productName:{type:String,require:true},
    productId:{type:String,require:true},
    drawId:{type:String,require:true,unique:true},
    shortId:{type:String,require:true,unique:true},
    date:{type:String,require:true},
    openDrawTime:{type:Number,require:true},
    closeDrawTime:{type:Number,require:true},
    openNumbers:[{type:Number}],
    closeNumbers:[{type:Number}],
    slot:[{type:String}],
    openDrawStatus:{type:String},
    closeDrawStatus:{type:String},
    status:{type:String}, 
},{timestamps:true});

module.exports = mongoose.model('draws', drawSchema)