const express = require("express");
const router = express.Router()
//const {PrismaClient} = require('@prisma/client')
let bcrypt = require('bcryptjs')
let jwt = require('jsonwebtoken');

//models
const Clients = require('../schemas/Clients')
const Survey = require('../schemas/Survey')

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1


router.post("/list-movil", async (req, res) => {

    try {
        //Extrae datos del body
        let id = Number(req.body.id)
        let type = String(req.body.type)

        if (type == 'MERCHA') {
            let clientes = await Clients.where({ Merchandising: id })
            let survey = await Survey.where({ Merchandising: id })

            let arr = []
            clientes.forEach(e => {
                let obj = {}
                obj._id = e._id
                obj.Codigo_Cliente = e.Codigo_Cliente
                obj.Nombre = e.Nombre
                obj.Direccion = e.Direccion
                obj.Telefono = e.Telefono
                obj.Localidad = e.Localidad
                obj.Provincia = e.Provincia
                obj.Objetive = false
                obj.Relevado = false

                survey.forEach(f => {
                    if (e.Codigo_Cliente == f.Codigo_Cliente) {

                        if(f.Año == year && f.Mes == mounth){
                            obj.Objetive = true
                        }
                        
                        if (f.Relevado == true) {
                            obj.Relevado = true
                        } 
                    }
                })//end for2

                arr.push(obj)
            })//end for
           
            res.status(200).json(arr)
        }


       



    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Error in Server...' })
    }
})//end




module.exports = router

