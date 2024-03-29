const express = require("express");
const router = express.Router()
let ObjectId = require('mongoose').Types.ObjectId;
const { personalFilter } = require('../controllers/utils/filters')


//models
const Chats = require('../schemas/Chats')

function SortArray(x, y){
    if (new Date(x.Mensajes[indice(x.Mensajes)].Date_msg) > new Date(y.Mensajes[indice(y.Mensajes)].Date_msg)) {return -1;}
    if (new Date(x.Mensajes[indice(x.Mensajes)].Date_msg) < new Date(y.Mensajes[indice(y.Mensajes)].Date_msg)) {return 1;}
    return 0;
  }
  const indice = (val) => {
    return val.length - 1
  }



router.put("/msg-update-leido", async (req, res) => {
    if (req.body) {
       
        let result = await Chats.findOne({ _id: req.body.id_chat })
        if (result) {
            result.Mensajes.forEach(e => {
                if(e.type_destino == req.body.type){
                    e.leido = true
                }              
            })

            let msg = result.save()
            if (msg) {
                res.status(200).json({status:200})//envio ya ordenado
            }
        }

    }//end if
})//end




module.exports = router

