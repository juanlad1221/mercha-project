const express = require("express");
const router = express.Router()
//const { PrismaClient } = require('@prisma/client')

//models
const Chats = require('../schemas/Chats')


let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1
        

router.post("/chats-movil", async (req, res) => {
    try {
        const { id, type } = req.body
        
        let allChats = await Chats.where({Type_user_emisor:type, User_id_emisor:String(id)}).sort({ status: 1 })
        if(allChats ){
            res.status(200).json(allChats)
        }    
       
    } catch (error) {
        console.log('Error in consult...')
    }
})//end post


module.exports = router