const express = require("express");
const router = express.Router()
let bcrypt = require('bcryptjs')
let jwt = require('jsonwebtoken');
//models
const Users = require('../schemas/Users')

//const prisma = new PrismaClient()
require("dotenv").config();
router.post("/auth-movil", async (req, res) => {

    try {
        //Extrae datos del body
        const {movil, password} = req.body
        console.log(movil, password)

        let Movil = movil.trim()
        let Password = password.trim()
        let user = await Users.findOne({active:true, phone:Movil})
        
        if(user){
            //password
            let resultPass = bcrypt.compareSync(Password, user.password);
            
            if(user && resultPass){
                let obj = {}
                //genero token
                let token = jwt.sign(obj, 'mercha1221 ', { expiresIn: '365d' })
              
                user.token = token
                let tokenAlmacenado = await user.save()

                if(tokenAlmacenado){
                    if(user.type == 'MERCHA'){
                        obj.id = user.id
                        obj.name = user.name
                        obj.phone = user.phone
                        obj.area_job = user.area_job
                        obj.type = user.type
                    }
                    if(user.type == 'SELLER'){
                        obj.id = user.id
                        obj.name = user.name
                        obj.phone = user.phone
                        obj.area_job = user.area_job
                        obj.type = user.type   
                    }
    
                    //agrego token
                    obj.token = token
                    //envio token y datos
                    res.status(200).json(obj)
                }             
            }else{
                res.status(404).json({msg:'Not Found...'})
            }
        }else{
            res.status(404).json({msg:'Not Found...'})
        }

    } catch (error) {
        console.log('error',error)
        res.status(500).json({msg:error})
    }
})//end




module.exports = router

