const express = require("express");
const router = express.Router()
let ObjectId = require('mongoose').Types.ObjectId;
const { filterByOneKey, filterByFourKey, filterByTwoKey } = require('../controllers/utils/filters')


//models
const Area = require('../schemas/Area')
const Chats = require('../schemas/Chats')
const Clients = require('../schemas/Clients')


router.post("/msg-new-movil", async (req, res) => {
    if (req.body) {
        console.log(req.body)
        let result3 = await Chats.where({})
        let result2 = await Clients.findOne({ Codigo_Cliente: String(req.body.id_cliente) })
        let data = await Area.findById({ _id: ObjectId(req.body.motivo.area_id) })

        if (data && result2 && result3) {
            let result = filterByOneKey('name_motivo', req.body.motivo.name_motivo, data.motivo)
            if (result.length == 1) {

                if (result3) {
                    let existe_pen = filterByFourKey('Codigo_Cliente', String(req.body.id_cliente), 'User_id_destino', String(req.body.id_destino), 'User_id_emisor', String(req.body.id_origen), 'status', 'pendiente', result3).length
                    let existe_act = filterByFourKey('Codigo_Cliente', String(req.body.id_cliente), 'User_id_destino', String(req.body.id_destino), 'User_id_emisor', String(req.body.id_origen), 'status', 'activo', result3).length

                    if (existe_pen == 0 && existe_act == 0) {
                        let obj = {
                            status: req.body.status,
                            Codigo_Cliente: req.body.id_cliente,
                            Nombre: result2.Nombre,
                            Direccion: result2.Direccion,
                            Type_user_destino: req.body.type_destino,
                            User_id_destino: req.body.id_destino,
                            Motivo: req.body.motivo.name_motivo,
                            Motivo_id: result[0]._id,
                            Area: data.name_area,
                            Area_id: req.body.motivo.area_id,
                            Type_user_emisor: req.body.type_origen,
                            User_id_emisor: req.body.id_origen,
                            Date: req.body.date,
                            Asunto:req.body.asunto,
                            status: req.body.status
                        }

                        let nuevoChat = await Chats.create(obj)
                        if (nuevoChat) {
                            nuevoChat.Mensajes.push({
                                msg: req.body.msg,
                                name: req.body.name_origen, type: req.body.type_origen, Date_msg: req.body.date
                            })
                            let msg_nuevo = await nuevoChat.save()

                            if (msg_nuevo) {
                                console.log('Se grabó nuevo correctamente...')

                                let result = await Chats.where({})
                                if (result) {
                                    let myChats = filterByTwoKey('Type_user_emisor', req.body.type_origen, 'User_id_emisor', String(req.body.id_origen), result)
                                    let myChats2 = filterByTwoKey('Type_user_destino', req.body.type_origen, 'User_id_destino', String(req.body.id_origen), result)
                                    if (myChats && myChats2) {
                                        //console.log(myChats.concat(myChats2))
                                        res.status(200).json({ status: 200, allChats: myChats.concat(myChats2) })
                                    }
                                }


                            }



                        }

                    } else {
                        console.log('ya existe el chat...')
                        res.status(400).json({ status: 400 })
                    }
                }

            }
        }

    }//end if
})//end




module.exports = router

