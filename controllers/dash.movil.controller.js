const express = require("express");
const router = express.Router()
const { personalFliter2, filterByTwoKey, SortArrayDesc, personalFliter4,
    personalFilter3, filterByThreeKey, filterByOneKey } = require('./utils/filters')

//models
const Survey = require('../schemas/Survey')
const Chats = require('../schemas/Chats')
//const Areas = require('../schemas/Area')

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1

router.post("/dash-movil", async (req, res) => {
    if (req.body) {
        console.log(req.body)
        let date = new Date(req.body.fecha)
        let f1 = new Date(date.getFullYear(), date.getMonth(), 1)
        let f2 = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        if (req.body.type == 'MERCHA') {
           let surveys = await Survey.where({ type: req.body.type, Merchandising: Number(req.body.id) })

            if (surveys) {
                let totalRelevado = personalFliter2(f1, f2, surveys)
                let aRelevar = filterByTwoKey('Año', year, 'Mes', mounth, surveys).length
                let objetivosMes = filterByThreeKey('Año', year, 'Mes', mounth, 'Relevado', true, surveys).length
                let avance = Math.round((objetivosMes * 100) / aRelevar) || 0

                let ultimo_ = filterByOneKey('Relevado', true, surveys)
                
                if (ultimo_.length == 0) {
                    let fecha_ultimo = 'no data'
                    let codigo_cliente= 'no data'
                    let nombre= 'no data' 
                    res.status(200).json({
                        totalRelevado,
                        aRelevar, objetivosMes,
                        avance, fecha_ultimo, codigo_cliente,nombre
                    })
                } else {
                    let ultimo = ultimo_.sort(SortArrayDesc)[0]
                    let fecha_ultimo = ultimo.Date
                    let codigo_cliente = ultimo.Codigo_Cliente
                    let nombre = ultimo.Nombre 
                    res.status(200).json({
                        totalRelevado,
                        aRelevar, objetivosMes,
                        avance, fecha_ultimo, codigo_cliente,nombre
                    })
                }
            }
        } else {
            let surveys = await Survey.where({ type: req.body.type, Vendedor: Number(req.body.id) })
            if (surveys) {
                let totalRelevado = personalFliter2(f1, f2, surveys)
                let aRelevar = filterByTwoKey('Año', year, 'Mes', mounth, surveys).length
                let objetivosMes = filterByThreeKey('Año', year, 'Mes', mounth, 'Relevado', true, surveys).length
                let avance = Math.round((objetivosMes * 100) / aRelevar) || 0

                let ultimo_ = filterByOneKey('Relevado', true, surveys)

                if (ultimo_.length == 0) {
                    let fecha_ultimo = 'no data'
                    let codigo_cliente= 'no data'
                    let nombre= 'no data' 
                    res.status(200).json({
                        totalRelevado,
                        aRelevar, objetivosMes,
                        avance, fecha_ultimo, codigo_cliente,nombre
                    })
                } else {
                    let ultimo = ultimo_.sort(SortArrayDesc)[0]
                    let fecha_ultimo = ultimo.Date
                    let codigo_cliente = ultimo.Codigo_Cliente
                    let nombre = ultimo.Nombre 
                    res.status(200).json({
                        totalRelevado,
                        aRelevar, objetivosMes,
                        avance, fecha_ultimo, codigo_cliente,nombre
                    })
                }
            }
        }

    }//end if body
})//end post


module.exports = router