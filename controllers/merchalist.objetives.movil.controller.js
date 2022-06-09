const express = require("express");
const router = express.Router()

//models
const Objetives = require('../schemas/Objetives')
const Survey = require('../schemas/Survey')

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1

router.post("/list-objetives-movil", async (req, res) => {
    try {
        const { id } = req.body
        
        let survey = await Survey.where({active:true, Merchandising:id, Año:year, Mes:mounth})
        //console.log(survey)
        if(survey){
            let data = survey
            res.status(200).json(data)
        }else{
            res.status(404).json({msg:'Data not found...'})
        }
        
    } catch (error) {
        console.log('Error in consult...')
    }
})//end post


module.exports = router