const express = require("express");
const router = express.Router()
const {personalFliter2, filterByTwoKey, SortArrayDesc,personalFliter4,
    personalFilter3, filterByThreeKey,filterByOneKey}  = require('./utils/filters')

//models
const Chats = require('../schemas/Chats')
//const Areas = require('../schemas/Area')

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1

router.post("/dash2-movil", async (req, res) => {
    if (req.body) {
        let date = new Date(req.body.fecha)
        let f1 = new Date(date.getFullYear(), date.getMonth(), 1)
        let f2 = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        let chats = await Chats.where({Date:{$gte: f1, $lte: f2 }})
        if (req.body.type == 'MERCHA') {
            //let chats = await Chats.where({Date:{$gte: f1, $lte: f2 }})
            if (chats) {
                let pendientesEmisor = filterByThreeKey('Type_user_emisor',req.body.type,'User_id_emisor',String(req.body.id),'status','pendiente',chats).length
                let pendientesDestino = filterByThreeKey('Type_user_destino',req.body.type,'User_id_destino',String(req.body.id),'status','pendiente',chats).length
                
                let activosEmisor = filterByThreeKey('Type_user_emisor',req.body.type,'User_id_emisor',String(req.body.id),'status','activo',chats).length
                let activosDestino = filterByThreeKey('Type_user_destino',req.body.type,'User_id_destino',String(req.body.id),'status','activo',chats).length
                
                
                res.status(200).json({pendientes:(pendientesDestino + pendientesEmisor), activos:(activosEmisor + activosDestino)})
            }
        }else{
            //let chats = await Chats.where({Date:{$gte: f1, $lte: f2 }})
            if (chats) {
                let pendientesEmisor = filterByThreeKey('Type_user_emisor',req.body.type,'User_id_emisor',String(req.body.id),'status','pendiente',chats).length
                let pendientesDestino = filterByThreeKey('Type_user_destino',req.body.type,'User_id_destino',String(req.body.id),'status','pendiente',chats).length
                
                let activosEmisor = filterByThreeKey('Type_user_emisor',req.body.type,'User_id_emisor',String(req.body.id),'status','activo',chats).length
                let activosDestino = filterByThreeKey('Type_user_destino',req.body.type,'User_id_destino',String(req.body.id),'status','activo',chats).length
                
                res.status(200).json({pendientes:(pendientesDestino + pendientesEmisor), activos:(activosEmisor + activosDestino)})
            }
        }

    }//end if body
})//end post


module.exports = router