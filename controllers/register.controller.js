const express = require("express")
const router = express.Router()
//const {PrismaClient} = require('@prisma/client')
let bcrypt = require('bcryptjs')
const User = require('../schemas/Users')
//const prisma = new PrismaClient()

router.post("/register", async (req, res) => {

    try {
        //Extrae datos del body
        const {phone, password, username, name, type} = req.body
        
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);
        
        let obj = {
            phone,
            password:hash,
            username,
            name,
            type
        }
        let user = await new User(obj)
        if(user){
            user.save()
            res.status(200).json({msg:'User created...'})
        }
        
        
            
        
            
        
       
    } catch (error) {
        console.log(error)
    }
})//end




module.exports = router
