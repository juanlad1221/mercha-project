const express = require("express");
const router = express.Router()
//const { PrismaClient } = require('@prisma/client')

//models
const Clients = require('../schemas/Clients')
const Survey = require('../schemas/Survey')
//Instancio prisma
//const prisma = new PrismaClient()

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1
        

router.post("/mercha-list-movil", async (req, res) => {
    try {
        const { id } = req.body

        let clientes = await Clients.where({active:true, Merchandising:id})
        let survey = await Survey.where({active:true, Merchandising:id, Año:year, Mes:mounth})
        
        if(clientes && survey){
            console.log('entro')
            let data = {clientes, survey}
            res.status(200).json(data)
        }else{
            res.status(404).json({msg:'Data not found...'})
        }
        
    } catch (error) {
        console.log('Error in consult...')
    }
})//end post


module.exports = router