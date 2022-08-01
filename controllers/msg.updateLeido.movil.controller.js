const express = require("express");
const router = express.Router()
let ObjectId = require('mongoose').Types.ObjectId;
//const { filterByOneKey, filterByFourKey, filterByTwoKey } = require('../controllers/utils/filters')


//models
const Chats = require('../schemas/Chats')



router.put("/msg-update-leido", async (req, res) => {
    if (req.body) {
        
        let result = await Chats.findOne({_id:req.body.id_chat})
        if (result) {
           result.Mensajes.forEach(e => {
            e.leido = true
           })

           let msg = result.save()
           if(msg){
            res.status(200).json({status:200})
           }
        }      
        
    }//end if
})//end




module.exports = router

