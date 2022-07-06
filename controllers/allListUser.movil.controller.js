const express = require("express");
const router = express.Router()

//models
const Users = require('../schemas/Users')
const Clients = require('../schemas/Clients')
const Areas = require('../schemas/Area')

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1

router.post("/all-list-movil", async (req, res) => {
    try {
        const { key } = req.body

        if (key == 'users') {
            let result = await Users.where({ active: true })

            if (result) {
                res.status(200).json(result)
            } else {
                res.status(404).json({ msg: 'Data not found...' })
            }
        }

        if (key == 'clients') {
            let result = await Clients.where({ active: true })

            if (result) {
                res.status(200).json(result)
            } else {
                res.status(404).json({ msg: 'Data not found...' })
            }
        }

        if (key == 'motives') {
            let result = await Areas.where({})

            if (result) {
                let arr = []
                result.forEach(e => {
                    e.motivo.forEach(f => {
                        if(f.active){
                            arr.push({area_id:e._id, name_motivo:f.name_motivo})
                        }
                    })
                })
                
                res.status(200).json(arr)
            } else {
                res.status(404).json({ msg: 'Data not found...' })
            }
        }

    } catch (error) {
        console.log('Error in consult...')
    }
})//end post


module.exports = router