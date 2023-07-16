const transactionModel = require('../../models/transactionModel');

const router = require('express').Router();


router.get("/:id",async function(req,res){
    const transactionData=await transactionModel.findById(req.params.id).populate('userData').lean().exec();
    res.json(transactionData);
});

module.exports=router;