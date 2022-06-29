const express = require("express");
const multer = require('multer')
const router = express.Router()
let moment = require('moment'); // require
const { storage } = require('./utils/multer.config')
const { filterByFourKey } = require('./utils/filters')
//models
const Survey = require('../schemas/Survey');
const Clients = require("../schemas/Clients");

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1

router.post('/upload-img', async (req, res) => {
    try {

        if (req.body) {
            //datos del movil
            let Codigo_Cliente = String(req.body.Codigo_Cliente.trim())
            let Id_user = Number(req.body.Id_user)
            let Pictures = req.body.Pictures
            let Msg = req.body.Msg
            let Total_Pictures = Number(req.body.Total_Pictures)
            let Objetive = req.body.Objetive

            //console.log(Codigo_Cliente, Id_user,Msg, Total_Pictures, Pictures)

            if (req.body.Type == 'MERCHA') {
                let existe = await Survey.exists({
                    Codigo_Cliente: Codigo_Cliente,
                    Merchandising: Id_user, type: 'MERCHA', Relevado: true
                })
                if (existe) {
                    console.log('Actualizo Correctamente...')
                    res.status(200).json({ msg: 'Envio Exitoso...', status: 200, type: 'MERCHA' })
                } else {

                    if (Objetive) {
                        //almaceno
                        let update = await Survey.updateOne({
                            Codigo_Cliente: Codigo_Cliente,
                            Merchandising: Id_user, type: 'MERCHA'
                        }, {
                            Relevado: true,
                            Pictures: Pictures, Msg: Msg,
                            Total_Pictures: Total_Pictures,
                            Date: moment().format('DD-MM-YYYY')
                        })
                        //console.log(update)
                        if (update.modifiedCount > 0) {
                            console.log('Actualizo Correctamente...')
                            res.status(200).json({ msg: 'Envio Exitoso...', status: 200, type: req.body.Type })
                        } else {
                            console.log('No se pudo Actualizar...')
                            res.status(400).json({ msg: 'Envio Exitoso...', status: 400, type: req.body.Type })
                        }
                    } else {
                        //Si objetive s false
                        dataClient = await Clients.findOne({ Codigo_Cliente: Codigo_Cliente })
                        if (dataClient) {
                            let obj = {
                                Codigo_Cliente: Codigo_Cliente,
                                Nombre: dataClient.Nombre,
                                Direccion: dataClient.Direccion,
                                Telefono: dataClient.Telefono,
                                Zona: dataClient.Zona,
                                Localidad: dataClient.Localidad,
                                Provincia: dataClient.Provincia,
                                Relevado: true,
                                Pictures: Pictures,
                                Msg: Msg,
                                Total_Pictures: Total_Pictures,
                                Date: moment().format('DD-MM-YYYY'),
                                active: true,
                                Merchandising: dataClient.Merchandising,
                                Nombre_Merchandising: dataClient.Nombre_Merchandising,
                                type: 'MERCHA',
                            }

                            let obj2 = {
                                Codigo_Cliente: Codigo_Cliente,
                                Nombre: dataClient.Nombre,
                                Direccion: dataClient.Direccion,
                                Telefono: dataClient.Telefono,
                                Zona: dataClient.Zona,
                                Localidad: dataClient.Localidad,
                                Provincia: dataClient.Provincia,
                                Vendedor: dataClient.Vendedor,
                                Nombre_Vendedor: dataClient.Nombre_Vendedor,
                                type: 'SELLER',
                                Relevado: false,
                                Pictures: [],
                                Total_Pictures: 0,
                                active: true
                            }

                            let inserto = await Survey.insertMany([obj, obj2])
                            if (inserto) {
                                console.log('Actualizo Correctamente...')
                                res.status(200).json({ msg: 'Envio Exitoso...', status: 200, type: req.body.Type })
                            }
                        } else {
                            console.log('Cliente no encontrado...')
                        }
                    }//end if objetive

                }//end if existe
            }//end if mercha

            if (req.body.Type == 'SELLER') {
                let existe = await Survey.exists({
                    Codigo_Cliente: Codigo_Cliente,
                    Vendedor: Id_user, Relevado: true
                })

                if (existe) {
                    console.log('Actualizo Correctamente...')
                    res.status(200).json({ msg: 'Envio Exitoso...', status: 200, type: 'SELLER' })
                } else {

                    if (Objetive) {
                        //almaceno
                        let update = await Survey.updateOne({
                            Codigo_Cliente: Codigo_Cliente,
                            Vendedor: Id_user
                        }, {
                            Relevado: true,
                            Pictures: Pictures, Msg: Msg,
                            Date: moment().format('DD-MM-YYYY')
                        })
                        if (update.modifiedCount == 1) {
                            console.log('Actualizo Correctamente...')
                            res.status(200).json({ msg: 'Envio Exitoso...', status: 200, type: 'SELLER' })
                        }
                    } else {
                        //Si objetive s false
                        dataClient = await Clients.findOne({ Codigo_Cliente: Codigo_Cliente })
                        if (dataClient) {
                            let obj = {
                                Codigo_Cliente: Codigo_Cliente,
                                client_id: dataClient._id,
                                Nombre: dataClient.Nombre,
                                Direccion: dataClient.Direccion,
                                Telefono: dataClient.Telefono,
                                Zona: dataClient.Zona,
                                Localidad: dataClient.Localidad,
                                Provincia: dataClient.Provincia,
                                Relevado: false,
                                Pictures: [],
                                Msg: '',
                                Total_Pictures: 0,
                                active: true,
                                Merchandising: dataClient.Merchandising,
                                Nombre_Merchandising: dataClient.Nombre_Merchandising,
                                type: 'MERCHA',
                            }

                            let obj2 = {
                                Codigo_Cliente: Codigo_Cliente,
                                client_id: dataClient._id,
                                Nombre: dataClient.Nombre,
                                Direccion: dataClient.Direccion,
                                Telefono: dataClient.Telefono,
                                Zona: dataClient.Zona,
                                Localidad: dataClient.Localidad,
                                Provincia: dataClient.Provincia,
                                Vendedor: dataClient.Vendedor,
                                Nombre_Vendedor: dataClient.Nombre_Vendedor,
                                type: 'SELLER',
                                Relevado: true,
                                Pictures: Pictures,
                                Msg: Msg,
                                Total_Pictures: Total_Pictures,
                                Date: moment().format('DD-MM-YYYY'),
                                active: true
                            }

                            let inserto = await Survey.insertMany([obj, obj2])
                            if (inserto) {
                                console.log('Actualizo Correctamente...')
                                res.status(200).json({ msg: 'Envio Exitoso...', status: 200, type: req.body.Type })
                            }
                        } else {
                            console.log('Cliente no encontrado...')
                        }
                    }//end objetive

                }//end if existe
            }//end seller


        }//end if body
    } catch (error) {
        console.log('Error try/catch - no body - in /upload-img....', error)
        res.status(400).end()
    }
})//end


module.exports = router