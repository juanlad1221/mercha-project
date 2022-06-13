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
            let consult = await Survey.findOne({Codigo_Cliente:req.body.Codigo_Cliente, 
                Merchandising:req.body.Merchandising })
                if(consult){
                    let update = await Survey.updateOne({ Codigo_Cliente:req.body.Codigo_Cliente, 
                        Merchandising:req.body.Merchandising }, { Relevado: true, Pictures:req.body.Pictures, Date: moment().format('DD-MM-YYYY') })
                    console.log('Actualizo Correctamente...')
                    
                    let dataToSend = await Survey.where({active:true, Merchandising:req.body.Merchandising, Año:year, Mes:mounth}) 
                        if(dataToSend){
                            res.status(200).json({msg:'Envio Exitoso...', status:200, type:'MERCHA', data:dataToSend})
                        }
                       
                }else{
                    res.status(404).json({msg:'No se encontró mercha/vendedor...'})
                }

        }
    } catch (error) {
        console.log('Error catch in /upload-img....')
    }
})//end





/*const upload = multer({ storage: storage })
router.post("/upload-img",upload.array('files', 4) ,async (req, res) => {
    try {
        
        console.log(req.files)
        console.log(req.body)
        
    } catch (error) {
        console.log('Error catch in /upload-img')
    }
})//end post*/


module.exports = router