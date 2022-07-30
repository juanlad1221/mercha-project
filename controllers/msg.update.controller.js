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
       
       let data = await Chats.findOne({_id:ObjectId(req.body.dataChat.id_chat)})
       if(data.status == 'finalizado'){
        console.log('El chat está finalizado...')
        res.status(400).end
       }

       //armo obj a actualizar
       let obj = {
        msg:req.body.msg,
        Date_msg:new Date(req.body.date_msg),
        name:req.body.name,
        type:req.body.dataChat.type_origen,
        status: req.body.status
       }

       //data.status = req.body.status
       let result = await data.Mensajes.push(obj)
       if(result && data){
        await data.save()
        
        //envio la actualizacion del chat...
        let data2 = await Chats.findOne({_id:ObjectId(req.body.dataChat.id_chat)})
        if(data2){
            let arr = []
            console.log(req.body)
            data2.Mensajes.forEach(e => {

                if(e.type == req.body.dataChat.type_origen){
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
            //console.log(data2.Mensajes)
            res.status(200).json({status:200,chats:arr})
        }
       
       }

    }//end if
})//end




module.exports = router

