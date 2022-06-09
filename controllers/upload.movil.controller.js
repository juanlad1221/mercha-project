const express = require("express");
const multer = require('multer')
const router = express.Router()
let moment = require('moment'); // require
const { storage } = require('./utils/multer.config')

//models
const Survey = require('../schemas/Survey')


router.post('/upload-img', async(req, res) => {
    try {
        if(req.body){
            
            //console.log(req.body)
            /*let update = await Survey.updateOne({ Codigo_Cliente:req.body.Codigo_Cliente, 
                Merchandising:req.body.Merchandising }, { Status: true, Pictures:req.body.Pictures })*/

            /*let consult = await Survey.where({Codigo_Cliente:req.body.Codigo_Cliente, 
                Merchandising:req.body.Merchandising })
            console.log(consult[0].Pictures[0])*/
            let consult = await Survey.findOne({Codigo_Cliente:req.body.Codigo_Cliente, 
                Merchandising:req.body.Merchandising })
                if(consult){
                    console.log('Actualizo Correctamente...')
                    let update = await Survey.updateOne({ Codigo_Cliente:req.body.Codigo_Cliente, 
                        Merchandising:req.body.Merchandising }, { Status: true, Pictures:req.body.Pictures, Date: moment().format('DD-MM-YYYY') })
                        res.status(200).json({msg:'Envio Exitoso...', status:200, type:'MERCHA'})
                }else{
                    res.status(404).json({msg:'No se encontró mercha/vendedor...'})
                }

        }
    } catch (error) {
        console.log('Error catch in /upload-img')
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