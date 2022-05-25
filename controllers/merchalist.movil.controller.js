const express = require("express");
const router = express.Router()
//const { PrismaClient } = require('@prisma/client')

//models
const Clients = require('../schemas/Clients')
const Objetives = require('../schemas/Objetives')
//Instancio prisma
//const prisma = new PrismaClient()

router.post("/mercha-list-movil", async (req, res) => {
    try {
        const { id } = req.body

        let currentTime = new Date();
        let year = currentTime.getFullYear()
        let mounth = currentTime.getMonth() + 1
        
        let clients = await Clients.where({active:true, Merchandising:id})
        let objetives = await Objetives.where({active:true, Merchandising:id, Año:year, Mes:mounth})
        
        if(clients.length > 0 && objetives.length > 0){
            
            clients.forEach(e => {
                objetives.forEach(f => {
                    if(e.Codigo_Cliente === f.Codigo_Cliente){
                        e.On_survey = true
                    }
                })
            })
            
            let data = clients
            res.status(200).json(data)
        }else{
            res.status(404).json({msg:'Data not found...'})
        }
        
    } catch (error) {
        console.log('Error in consult...')
    }
})//end post


module.exports = router