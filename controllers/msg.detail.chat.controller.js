const express = require("express");
const router = express.Router()
let ObjectId = require('mongoose').Types.ObjectId;
const { filterByOneKey, filterByFourKey } = require('./utils/filters')


//models
const Area = require('../schemas/Area')
const Chats = require('../schemas/Chats')
const Clients = require('../schemas/Clients')


router.post("/msg-detail-movil", async (req, res) => {
    if (req.body) {
        const {id_chat, type} = req.body
        let arr = []
        let data = await Chats.findOne({_id:ObjectId(id_chat)})
        data.Mensajes.forEach(e => {

            if(e.type == type){
                let obj = {
                    _id: e._id,
                    //_id:Math.round(Math.random() * 1000000),
                    text: e.msg,
                    createdAt: new Date(e.Date_msg),
                    user: {
                      _id: 1,
                      name: e.name
                    },
                  }
                arr.push(obj)
            }else{
                let obj = {
                    _id: e._id,
                    //_id:Math.round(Math.random() * 1000000),
                    text: e.msg,
                    createdAt: new Date(e.Date_msg),
                    user: {
                      _id: 2,
                      name: e.name
                    },
                  }
                arr.push(obj)
            }
        })//end
        
        res.status(200).json(arr)
    }//end if
})//end


module.exports = router

