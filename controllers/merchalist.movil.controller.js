const express = require("express");
const { find } = require("../schemas/Chats");
const router = express.Router()
const { personalFilter } = require('./utils/filters')


//models
const Chats = require('../schemas/Chats')


let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1

function SortArray(x, y){
    if (new Date(x.Mensajes[indice(x.Mensajes)].Date_msg) > new Date(y.Mensajes[indice(y.Mensajes)].Date_msg)) {return -1;}
    if (new Date(x.Mensajes[indice(x.Mensajes)].Date_msg) < new Date(y.Mensajes[indice(y.Mensajes)].Date_msg)) {return 1;}
    return 0;
  }
  const indice = (val) => {
    return val.length - 1
  }
        

router.post("/chats-movil", async (req, res) => {
    try {
        const { id, type } = req.body
       
        let allChats = await Chats.where({})
        if(allChats){
            let misChats = personalFilter('User_id_emisor',String(id),'Type_user_emisor',type,'User_id_destino',String(id),'Type_user_destino',type,allChats)
            //console.log(misChats)
            if(misChats ){    
                let dataToSend = misChats.sort(SortArray)          
                res.status(200).json(dataToSend)//envio ya ordenado
            }  
        }
        

          
       
    } catch (error) {
        console.log('Error in consult...')
    }
})//end post


module.exports = router