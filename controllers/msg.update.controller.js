const express = require("express");
const router = express.Router()
let ObjectId = require('mongoose').Types.ObjectId;
const { filterByOneKey, filterByFourKey } = require('./utils/filters')


//models
const Area = require('../schemas/Area')
const Chats = require('../schemas/Chats')
const Clients = require('../schemas/Clients')


router.put("/msg-update-movil", async (req, res) => {
    if (req.body) {
    console.log(req.body)
       let data = await Chats.findOne({_id:ObjectId(req.body.dataChat.id_chat)})
       if(data.status == 'finalizado'){
        res.status(400).end
       }
       let obj = {
        msg:req.body.msg,
        Date_msg:new Date(req.body.date_msg),
        name:req.body.name,
        type:req.body.dataChat.type_origen
       }

       let result = await data.Mensajes.push(obj)
       if(result){
        await data.save()
        res.status(200).json({status:200})
       }

    }//end if
})//end




module.exports = router

