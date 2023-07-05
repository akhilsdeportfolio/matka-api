var express = require('express');
var router = express.Router();
const moment = require('moment');
const data = require('../../finalData.json');
const drawModel = require('../../models/drawModel');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const days= Number(req?.query?.days || 0);  
  const playDays=[moment().format("DD-MM-YYYY")];
  for(let i=1;i<=days;i++)
  {
    playDays.push(moment().add(i,'d').format("DD-MM-YYYY"))
  }
  const data =await drawModel.find({date:{$in:playDays}}).exec();
  const playable = data.filter((el)=>{        
    const timeToExpire = moment().diff(
          moment.unix(el.openDrawTime)
      );      
      return timeToExpire < 0; 
  },)
  res.status(200).json({status:true,totalGames:data.length,availableForPlay:playable.length,games:playable});  
});


/* router.get('/createDrawData',async (req,res)=>{


    await data.forEach(async (element) => {

      await drawModel.create({...element})
      
    });

    res.send("Created Succesfully");


}); */



router.get('/:id', function(req, res, next) {
  const filtered = data.filter((el,i)=>{    
    if(i===0)
    console.log(el)
    if(el.shortId===req.params.id || el.drawId===req.params.id)
    return true;
  })
  res.json({status:true,data:filtered});
});

module.exports = router;
