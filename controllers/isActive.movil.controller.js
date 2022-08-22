const express = require("express");
const router = express.Router()
let bcrypt = require('bcryptjs')
let jwt = require('jsonwebtoken');
//models
const Users = require('../schemas/Users')
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjEwOTcxMTAsImV4cCI6MTY5MjYzMzExMH0.DB71SUDx66JaAX7eJrQ1ZW3V0dBRxtnaORFMX82NZvo

router.post("/is-active-movil", async (req, res) => {
    
    try {
        //Extrae datos del body
        const {token} = req.body
        
        let tokenRecibido = token
        
        if(token.length == 0){
            console.log('No token provisto...')
            res.status(404).json({status:404})
        }else{
            let user = await Users.findOne({active:true, token:tokenRecibido})
            if(user){
                let obj = {}
                obj.id = user.id
                obj.name = user.name
                obj.phone = user.phone
                obj.area_job = user.area_job
                obj.type = user.type
                obj.token = user.token

                res.status(200).json(obj)
            }else{
                
                console.log('Token no encontrado...')
                res.status(405).json({status:405})
            }          
        }

    } catch (error) {
        console.log('error',error)
        res.status(500).json({msg:error})
    }
})//end




module.exports = router

