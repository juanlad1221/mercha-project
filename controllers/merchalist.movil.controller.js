const express = require("express");
const { find } = require("../schemas/Chats");
const router = express.Router()
const { personalFilter } = require('./utils/filters')


//models
const Chats = require('../schemas/Chats')


let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1
        

router.post("/chats-movil", async (req, res) => {
    try {
        const { id, type } = req.body
        
        let allChats = await Chats.where({})
        let misChats = personalFilter('User_id_emisor',String(id),'Type_user_emisor',type,'User_id_destino',String(id),'Type_user_destino',type,allChats)
        if(misChats ){              
            //console.log(allChats)
            res.status(200).json(misChats)
        }    
       
    } catch (error) {
        console.log('Error in consult...')
    }
})//end post


module.exports = router