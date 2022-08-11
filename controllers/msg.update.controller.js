const express = require("express");
const router = express.Router()
let ObjectId = require('mongoose').Types.ObjectId;
const { filterByOneKey, filterByFourKey,personalFilter } = require('./utils/filters')


//models
const Area = require('../schemas/Area')
const Chats = require('../schemas/Chats')
const Clients = require('../schemas/Clients')


router.put("/msg-update-movil", async (req, res) => {
  if (req.body) {
   
    let data = await Chats.findOne({ _id: ObjectId(req.body.id_chat) })
    if (data.status == 'terminado') {
      console.log('El chat está finalizado...')
      res.status(400).end
    }

    //armo obj a actualizar
    /*let obj = {
      msg: req.body.msg,
      Date_msg: new Date(req.body.date_msg),
      name: req.body.name,
      leido:req.body.leido,
      type_origen: req.body.dataChat.type_origen,
      type_destino:req.body.dataChat.type_destino
    }*/

    let result = await data.Mensajes.push(req.body.msg)
    if (result && data) {
      if (req.body.status == 'terminado') {
        data.status = 'terminado'
      } else {
        data.status = 'activo'
      }


      let update = await data.save()

      //envio la actualizacion del chat...
      //let data2 = await Chats.findOne({_id:ObjectId(req.body.dataChat.id_chat)})

      if (update) {
        let allChats = await Chats.where({})
        let misChats = personalFilter('User_id_emisor', String(req.body.id_origen), 'Type_user_emisor', req.body.type_origen, 'User_id_destino', String(req.body.id_origen), 'Type_user_destino', req.body.type_origen, allChats)

        if (misChats) {
          res.status(200).json(misChats)
        }
        //let arr = []
        //let new_chats = await Chats.where({_id:ObjectId(req.body.dataChat.id_chat)})
        /*data2.Mensajes.forEach(e => {

            if(e.type == req.body.dataChat.type_origen){
                let obj = {
                    _id: e._id,
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
                    text: e.msg,
                    createdAt: new Date(e.Date_msg),
                    user: {
                      _id: 2,
                      name: e.name
                    },
                  }
                arr.push(obj)
            }
        })//end*/
        //res.status(200).json({status:200,chats:arr})
      }

    }

  }//end if
})//end




module.exports = router

