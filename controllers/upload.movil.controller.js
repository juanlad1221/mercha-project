const express = require("express");
const multer = require('multer')
const router = express.Router()
let moment = require('moment'); // require
const { storage } = require('./utils/multer.config')

//models
const Survey = require('../schemas/Survey')

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1

router.post('/upload-img', async(req, res) => {
    try {
        
        if(req.body){
            //datos del movil
            let Codigo_Cliente = String(req.body.Codigo_Cliente.trim())
            let Id_user = Number(req.body.Id_user)
            let Pictures = req.body.Pictures
            let Msg = String(req.body.Msg.trim())
            let Total_Pictures = Number(req.body.Total_Pictures)

            if(req.body.Type == 'MERCHA'){
                let existe = await Survey.exists({Codigo_Cliente: Codigo_Cliente, 
                    Merchandising: Id_user, Relevado: true})
                if(existe){
                    console.log('Actualizo Correctamente...')
                    res.status(200).json({msg:'Envio Exitoso...', status:200, type:'MERCHA'})
                }else{
                    //almaceno
                    let update = await Survey.updateOne({ Codigo_Cliente: Codigo_Cliente, 
                        Merchandising: Id_user }, { Relevado: true, 
                        Pictures: Pictures, Msg: Msg,
                        Total_Pictures: Total_Pictures,
                        Date: moment().format('DD-MM-YYYY')})
                        
                    if(update.modifiedCount == 1){
                        console.log('Actualizo Correctamente...')
                        res.status(200).json({msg:'Envio Exitoso...', status:200, type:'MERCHA'})
                    }
                }//end if existe
            }//end if mercha
            
            if(req.body.Type == 'SELLER'){
                let existe = await Survey.exists({Codigo_Cliente: Codigo_Cliente, 
                    Vendedor: Id_user,Relevado:true})
                
                if(existe){
                    console.log('Actualizo Correctamente...')
                    res.status(200).json({msg:'Envio Exitoso...', status:200, type:'SELLER'})
                }else{
                    //almaceno
                    let update = await Survey.updateOne({ Codigo_Cliente: Codigo_Cliente, 
                        Vendedor: Id_user }, { Relevado: true, 
                        Pictures: Pictures, Msg: Msg,
                        Date: moment().format('DD-MM-YYYY')})
                    if(update.modifiedCount == 1){
                        console.log('Actualizo Correctamente...')
                        res.status(200).json({msg:'Envio Exitoso...', status:200, type:'SELLER'})
                    }
                }//end if existe
            }//end seller
           

        }//end if body
    } catch (error) {
        console.log('Error try/catch - no body - in /upload-img....')
        res.status(400).end()
    }
})//end


module.exports = router