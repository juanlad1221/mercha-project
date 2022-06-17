const express = require("express");
const router = express.Router()
const passport = require('passport')
const multer = require('multer')
const path = require('path');
const XLSN = require('xlsx')
let bcrypt = require('bcryptjs')
var moment = require('moment'); // require
const {base, objMes, relevados, getMerchaReleved, getSellerReleved} = require('./utils/filters')
const isAuthenticated = require('./utils/isAutenticated')
const { storage, storagexls } = require('./utils/multer.config')
//const {Base64} = require('js-base64');//
//const { PrismaClient } = require('@prisma/client')

//models
const Users = require('../schemas/Users')
const Xls = require('../schemas/xls')
const Clients = require('../schemas/Clients')
const Objetives = require('../schemas/Objetives');
const Survey = require("../schemas/Survey");
const { type } = require("os");
const { route } = require("./upload.movil.controller");
const { clearScreenDown } = require("readline");
const { collection } = require("../schemas/Users");
//const prisma = new PrismaClient()

let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1


router.get('', function (req, res) {
  res.render('../views/login')
})//end get


router.get('/dashboard', isAuthenticated, function (req, res) {
  res.render('../views/dashboard', { user: req.user.name })
})//end get


router.get("/logout", isAuthenticated, function (req, res) {
  req.logOut();
  res.redirect('/');
})//end get


router.get("/load_clientes", isAuthenticated, async (req, res) => {
  try {
    let user = req.user.name
    let xls = await Xls.where({ type: 'CLIENTS' })

    if (xls.length === 1) {
      res.render('../views/upload_clientes', { user, flag: true, validated: xls[0].validated, error: xls[0].validated, processed: xls[0].processed })
    } else {
      res.render('../views/upload_clientes', { user, flag: false, validated: false, error: false, processed: false })
    }

  } catch (error) {
    console.log(error)
  }
})//end get


router.get("/load_objetivos", isAuthenticated, async (req, res) => {
  try {
    let user = req.user.name
    let xls = await Xls.where({ type: 'OBJETIVES' })

    if (xls.length === 1) {
      res.render('../views/upload_objetivos', { user, flag: true, validated: xls[0].validated, processed: xls[0].processed })
    } else {
      res.render('../views/upload_objetivos', { user, flag: false, validated: false, processed: false })
    }

  } catch (error) {
    console.log(error)
  }
})//end get


router.get('/validar-clientes', async (req, res) => {

  try {
    let user = req.user.name
    let xls = await Xls.findOne({ type: 'CLIENTS' })

    //verifico que sea excel el archivo
    let file = path.basename(xls.url)
    if (path.extname(file) != '.xlsx') {
      //hay error en excel
      let update = await Xls.updateOne({ type: 'CLIENTS' }, { validated: false, error: true })
      res.redirect('/load_clientes')
    }


    let update = await Xls.updateOne({ type: 'CLIENTS' }, { validated: true })

    if (update.modifiedCount == 1) {
      res.redirect('load_clientes')
    }
    //completo los telefonos
    /*const workbook = XLSN.readFile(xls.url)
      const workbookSheet = workbook.SheetNames
      let sheet = workbookSheet[0]
      const dataexcel = XLSN.utils.sheet_to_json(workbook.Sheets[sheet])

      let arr=[]
      dataexcel.forEach(e => {
       if(!isKeyExists(e,'Telefono')){
          e.Telefono = 'sin datos'
       } 
       arr.push(e)
      })*/

    //if(arr){console.log(arr)}
    /*let update = await Xls.updateOne({ type: 'CLIENTS' }, { validated: true })

    if (update.modifiedCount == 1) {
      res.redirect('load_clientes')
    }*/
  } catch (error) {
    console.log(error)
  }

})//end get


router.get('/validar-objetivos', async (req, res) => {
  let update = await Xls.updateOne({ type: 'OBJETIVES' }, { validated: true })

  if (update.modifiedCount == 1) {
    res.redirect('load_objetivos')
  }
})//end get



//Cargo xls clientes en bd
router.get('/procesar-clientes', async (req, res) => {
  try {
    let user = req.user.name
    let url = await Xls.findOne({ type: 'CLIENTS' })

    if (url.type === 'CLIENTS') {
      const workbook = XLSN.readFile(url.url)
      const workbookSheet = workbook.SheetNames
      let sheet = workbookSheet[0]
      const dataexcel = XLSN.utils.sheet_to_json(workbook.Sheets[sheet])

      let arr = []
      dataexcel.forEach(e => {
        if (!isKeyExists(e, 'Telefono')) {
          e.Telefono = 'sin datos'
        }
        arr.push(e)
      })

      //borro la bd.
      let result = await Clients.collection.drop()



      //inserto clientes xls en la bd
      let insert = await Clients.insertMany(arr)
      if (insert) {
        let update = await Xls.updateOne({ type: 'CLIENTS' }, { processed: true })
        if (update.modifiedCount == 1) {
          res.redirect('load_clientes')
        }
      }

    } else {
      console.log('tabla file excel vacia...')
    }

  } catch (error) {
    console.log(error)
  }

})//end get


//Procesar objetivos xls
router.get('/procesar-objetivos', async (req, res) => {
  try {
    //traigo la url de objetivos
    let url = await Xls.findOne({ type: 'OBJETIVES' })

    if (url.type === 'OBJETIVES') {
      const workbook = XLSN.readFile(url.url)
      const workbookSheet = workbook.SheetNames
      let sheet = workbookSheet[0]
      const dataexcel = XLSN.utils.sheet_to_json(workbook.Sheets[sheet])

      let arr = []
      dataexcel.forEach(e => {
        if (!isKeyExists(e, 'Telefono')) {
          e.Telefono = 'sin datos'
        }

        arr.push(e)
      })

      //borro objetivos de la bd.
      let result = await Objetives.collection.drop()

      //inserto xls objetivos en bd
      let status_insert = await Objetives.insertMany(arr)
      if (status_insert) {
        //traigo los objetivos del mes a insertar en survey
        let objetives = await Objetives.where({ Año: year, Mes: mounth })

        //Borro por las dudas de survey lo q haya de objetivos para el mes.
        let status_delete = await Survey.deleteMany({ Año: year, Mes: mounth, Relevado: false })

        //Inserto los objetivos del año y mes
        let status_insert_survey = await Survey.insertMany(objetives)
        if (status_insert_survey) {
          let update = await Xls.updateOne({ type: 'OBJETIVES' }, { processed: true })
          if (update.modifiedCount == 1) {
            res.redirect('load_objetivos')
          }

        }
      }

    } else {
      console.log('tabla file excel vacia...')
    }

  } catch (error) {
    console.log(error)
  }

})

router.get('/gestion', isAuthenticated, (req, res) => {
  let user = req.user.name
  res.render('../views/gestion', { user })
})

router.get('/administrador', isAuthenticated, (req, res) => {
  let user = req.user.name
  res.render('../views/administrador', { user })
})

router.get('/clientes', async (req, res) => {
  let user = req.user.name

  res.render('../views/clientes', { user })
})//end get

router.get('/objetivos', async (req, res) => {
  let user = req.user.name

  res.render('../views/objetivos', { user })
})//end get

router.get('/control-relevamientos', async (req, res) => {
  let user = req.user.name

  res.render('../views/control_relevamientos', { user })
})//end get

router.get('/clientes-relevamientos:id&:tipo', async (req, res) => {
  let id = req.params.id
  let tipo = req.params.tipo
  let user = req.user.name
  global.tipo = tipo
  global.id_usuario = id
  
  res.render('../views/clientes_relevamientos', { user, id, tipo })
})

router.get('/detalle-relevamiento:cliente&:fecha', async (req, res) => {
  try {
    let cliente = req.params.cliente
    let fecha = req.params.fecha
    let tipo = global.tipo
    let id_usuario = Number(global.id_usuario)
    let user = req.user.name

    //consulto las fotos
    if(tipo == 'MERCHA'){
      let result = await Survey.findOne({Codigo_Cliente:cliente, Date:fecha, Merchandising:id_usuario})
      if(result){
        let dataMercha = {
          fotos:result.Pictures,
          Nombre:result.Nombre
        }
        res.render('../views/detalle_relevamiento', { user, dataMercha })
      }
    }//END IF
    
   

  } catch (error) {
    console.log(error)
  }
})//end get

//apis internas
router.get('/api-clientes', async (req, res) => {
  //traigo datos de la bd
  let clientes = await Clients.where({ active: true })

  let data = { data: clientes }
  res.status(200).json(data)
})//end get

router.get('/api-objetivos', async (req, res) => {
  //traigo datos de la bd
  let objetivos = await Objetives.where({ active: true })

  let data = { data: objetivos }
  res.status(200).json(data)
})//end get

router.get('/api-gestion', async (req, res) => {
  try {
    //traigo datos de la bd
    let merchas = await Users.where({ type: 'MERCHA' })
    let Vendedores = await Users.where({ type: 'SELLER' })
    //let survey = await Survey.where({})
    //console.log(merchas)
    //console.log('uno',await Survey.where({Merchandising:1}).sort({ _id: -1 }))
    //console.log(await Survey.where({Merchandising:e.id}).sort({ _id: -1 }).limit(5))
    let arr = []
    let yu = [1]
    let obj = {}
    yu.forEach(async e => {

      //obj.id = e.id

      let ultima_fecha = await Survey.where({ Merchandising: e.id }).sort({ _id: -1 })
      //obj.date = ultima_fecha[0].Date

      let total_base = await Clients.where({ Merchandising: e.id }).count()
      //obj.total_base = total_base

      let objetivos_mes = await Objetives.where({ Merchandising: e.id, Año: year, Mes: mounth }).count()
      //obj.objetivos_mes = objetivos_mes

      let relevados_mes = await Survey.where({ Merchandising: e.id, Año: year, Mes: mounth, Status: true }).count()
      //obj.relevados_mes = relevados_mes

      let porcentaje = (100 * Number(relevados_mes)) / Number(objetivos_mes)
      //obj.porcentaje = porcentaje


      arr.push(relevados_mes)

    })


    console.log(arr)
    let data = { data: arr }
    res.status(200).json(data)
  } catch (error) {
    console.log(error)
  }
})//end get

router.post('/api-relevamientos', async (req, res) => {

  if (req.body) {
    if (req.body.mes) {
      console.log(req.body)
      let año_solo = new Date(req.body.mes).getFullYear()
      let oneDate = moment(req.body.mes, 'DD-MM-YYYY')
      let mes_solo = Number(oneDate.format('MM'))
      
      switch (req.body.type) {
        case 'todos':
          let surveys = await Survey.where({ Año: año_solo, Mes:mes_solo})
          let all_users = await Users.where({})

          if (all_users && surveys) {
            let arr = []

            all_users.forEach(e => {
              if (e.type != 'ADMIN') {
                let obj = {}
                obj.id = e.id
                obj.Date_ultimo = 'no data'
                obj.name = e.name
                obj.type = e.type

                if(e.type == 'MERCHA'){
                  let list = getMerchaReleved(e.id,surveys)
                  if(list.length > 0){
                    obj.Date_ultimo = list.sort((a,b) =>{
                      if(a.Date > b.Date){return -1};
                      if(a.Date < b.Date){return 1};
                      return 0;
                    })[0].Date
                  }else{
                    obj.Date_ultimo = 'no data'
                  }
                }

                if(e.type == 'SELLER'){
                  let lista = getSellerReleved(e.id,surveys)
                  if(lista.length > 0){  
                    obj.Date_ultimo = lista.sort((a,b) =>{
                    if(a.Date > b.Date){return -1}
                    if(a.Date < b.Date){return 1}
                    return 0
                    })[0].Date
                  }else{
                    obj.Date_ultimo = 'no data'
                  }
                  
                }

                obj.total_base = base(e.id,surveys)
                let objm = objMes(e.id, año_solo, mes_solo, surveys)
                obj.obj_mes = objm
                let rel = relevados(e.id, año_solo, mes_solo, true,surveys)
                obj.relevados = rel
                obj.porcentaje = Math.round((100 * rel)/objm) || 0
                arr.push(obj)
              }
            })//end for

            let data = { data: arr }
            res.status(200).json(data)
          }
          break
        case 'mercha':
          let survey_mercha = await Survey.where({Año: año_solo, Mes:mes_solo})
          let all_users_mercha = await Users.where({type:'MERCHA'})

          if (all_users_mercha && survey_mercha) {
            let arr2 = []

            all_users_mercha.forEach(e => {
              if (e.type != 'ADMIN') {
                let obj = {}
                obj.id = e.id
                obj.Date_ultimo = 'no data'
                obj.name = e.name
                obj.type = e.type

                if(e.type == 'MERCHA'){
                  let list = getMerchaReleved(e.id,surveys)
                  if(list.length > 0){
                    obj.Date_ultimo = list.sort((a,b) =>{
                      if(a.Date > b.Date){return -1};
                      if(a.Date < b.Date){return 1};
                      return 0;
                    })[0].Date
                  }else{
                    obj.Date_ultimo = 'no data'
                  }
                }

                obj.total_base = base(e.id,survey_mercha)
                let objm = objMes(e.id, año_solo, mes_solo, survey_mercha)
                obj.obj_mes = objm
                let rel = relevados(e.id, año_solo, mes_solo, true,survey_mercha)
                obj.relevados = rel
                obj.porcentaje = Math.round((100 * rel)/objm) || 0
                arr2.push(obj)
              }
            })//end for

            let data = { data: arr2 }
            res.status(200).json(data)
          }
          break
          case 'seller':
            let survey_seller = await Survey.where({Año: año_solo, Mes:mes_solo})
            let all_users_seller = await Users.where({type:'SELLER'})
  
            if (all_users_seller && survey_seller) {
              let arr3 = []
  
              all_users_seller.forEach(e => {
                if (e.type != 'ADMIN') {
                  let obj = {}
                  obj.id = e.id
                  obj.Date_ultimo = 'no data'
                  obj.name = e.name
                  obj.type = e.type

                  if(e.type == 'SELLER'){
                    let lista = getSellerReleved(e.id,surveys)
                    if(lista.length > 0){  
                      obj.Date_ultimo = lista.sort((a,b) =>{
                      if(a.Date > b.Date){return -1}
                      if(a.Date < b.Date){return 1}
                      return 0
                      })[0].Date
                    }else{
                      obj.Date_ultimo = 'no data'
                    }  
                  }

                  obj.total_base = base(e.id,survey_seller)
                  let objm = objMes(e.id, año_solo, mes_solo, survey_seller)
                  obj.obj_mes = objm
                  let rel = relevados(e.id, año_solo, mes_solo, true,survey_seller)
                  obj.relevados = rel
                  obj.porcentaje = Math.round((100 * rel)/objm) || 0
                  arr3.push(obj)
                }
              })//end for
  
              let data = { data: arr3 }
              res.status(200).json(data)
            }
            break
      }//end switch
    }//end if body mes
  }//end if body
})//end post

router.post('/api-clientes-relevamietos', async (req, res) => {
  if(req.body){
    if(req.body.mes){
      //obtengo los datos
      let año_solo = new Date(req.body.mes).getFullYear()
      let oneDate = moment(req.body.mes, 'DD-MM-YYYY')
      let mes_solo = Number(oneDate.format('MM'))
      let user = Number(req.body.idUser)
      let type_user = req.body.typeUser

      switch (req.body.type) {
        case 'todos':
          if(type_user == 'MERCHA'){
            let surveyAll = await Survey.where({Merchandising:user,Año:año_solo,Mes:mes_solo})
            let arr = []

            if(surveyAll){
              surveyAll.forEach(e => {
                let obj = {}
                obj.id = e.Codigo_Cliente
                obj.Date_ultimo = e.Date
                obj.name = e.Nombre
                obj.direccion = e.Direccion
                obj.localidad = e.Localidad
                obj.Total_Pictures = e.Total_Pictures

                arr.push(obj)
              })//end
              
              //envio datos
              let data = { data: arr }
              res.status(200).json(data)
            }
          }
          if(type_user == 'SELLER'){
            let sellerAll = await Survey.where({Vendedor:user,Año:año_solo,Mes:mes_solo})
            let arr = []

            if(sellerAll){
              sellerAll.forEach(e => {
                let obj = {}
                obj.id = e.Codigo_Cliente
                obj.Date_ultimo = e.Date
                obj.name = e.Nombre
                obj.direccion = e.Direccion
                obj.localidad = e.Localidad
                obj.Total_Pictures = e.Total_Pictures

                arr.push(obj)
              })//end
              
              //envio datos
              let data = { data: arr }
              res.status(200).json(data)
            }
          }
          break
        case 'relevados':
          if(type_user == 'MERCHA'){
            let surveyAll = await Survey.where({Merchandising:user,Año:año_solo,Mes:mes_solo, Relevado:true})
            let arr = []

            if(surveyAll){
              surveyAll.forEach(e => {
                let obj = {}
                obj.id = e.Codigo_Cliente
                obj.Date_ultimo = e.Date
                obj.name = e.Nombre
                obj.direccion = e.Direccion
                obj.localidad = e.Localidad
                obj.Total_Pictures = e.Total_Pictures

                arr.push(obj)
              })//end
              
              //envio datos
              let data = { data: arr }
              res.status(200).json(data)
            }
          }

          if(type_user == 'SELLER'){
            let sellerAll = await Survey.where({Vendedor:user,Año:año_solo,Mes:mes_solo, Relevado:true})
            let arr = []

            if(sellerAll){
              sellerAll.forEach(e => {
                let obj = {}
                obj.id = e.Codigo_Cliente
                obj.Date_ultimo = e.Date
                obj.name = e.Nombre
                obj.direccion = e.Direccion
                obj.localidad = e.Localidad
                obj.Total_Pictures = e.Total_Pictures

                arr.push(obj)
              })//end
              
              //envio datos
              let data = { data: arr }
              res.status(200).json(data)
            }
          }
          break
        case 'sin-relevar':
          if(type_user == 'MERCHA'){
            let surveyAll = await Survey.where({Merchandising:user,Año:año_solo,Mes:mes_solo, Relevado:false})
            let arr = []

            if(surveyAll){
              surveyAll.forEach(e => {
                let obj = {}
                obj.id = e.Codigo_Cliente
                obj.Date_ultimo = e.Date
                obj.name = e.Nombre
                obj.direccion = e.Direccion
                obj.localidad = e.Localidad
                obj.Total_Pictures = e.Total_Pictures

                arr.push(obj)
              })//end
              
              //envio datos
              let data = { data: arr }
              res.status(200).json(data)
            }
          }

          if(type_user == 'SELLER'){
            let sellerAll = await Survey.where({Vendedor:user,Año:año_solo,Mes:mes_solo, Relevado:false})
            let arr = []

            if(sellerAll){
              sellerAll.forEach(e => {
                let obj = {}
                obj.id = e.Codigo_Cliente
                obj.Date_ultimo = e.Date
                obj.name = e.Nombre
                obj.direccion = e.Direccion
                obj.localidad = e.Localidad
                obj.Total_Pictures = e.Total_Pictures

                arr.push(obj)
              })//end
              
              //envio datos
              let data = { data: arr }
              res.status(200).json(data)
            }
          }
          

          break
      }//end switch
    }//end if mes
  }//end if body
})//end post










router.get('/download/clientes', async (req, res) => {
  let xls = await Xls.where({ type: 'CLIENTS' })

  res.status(200).download(xls[0].url)
})//end get

router.get('/download/objetivos', async (req, res) => {
  let xls = await Xls.where({ type: 'OBJETIVES' })

  res.status(200).download(xls[0].url)
})//end get





//Upload clientes
const upload = multer({ storage: storagexls })
router.post('/upload/clientes', upload.single('file'), async (req, res) => {

  try {
    //inserto nvo documneto CLIENTS
    let obj = {
      url: req.file.path,
      type: 'CLIENTS',
      error: false
    }

    let status_delete = await Xls.deleteOne({ type: 'CLIENTS' })

    if (status_delete) {
      let new_xls = await new Xls(obj)
      new_xls.save()

      if (new_xls) {
        res.redirect('/load_clientes')
      }
    }


  } catch (error) {
    console.log(error)
  }

})//end post

//upload objetives
router.post('/upload/objetives', upload.single('file'), async (req, res) => {

  try {
    //inserto nvo documneto CLIENTS
    let obj = {
      url: req.file.path,
      type: 'OBJETIVES'
    }

    let status_delete = await Xls.deleteOne({ type: 'OBJETIVES' })
    if (status_delete) {
      let new_xls = await new Xls(obj)
      new_xls.save()

      if (new_xls) {
        res.redirect('/load_objetivos')
      }
    }




    //Grabo xls en documents objetives
    /*if (req.file) {
      const workbook = XLSN.readFile(req.file.path)
      const workbookSheet = workbook.SheetNames
      let sheet = workbookSheet[0]
      const dataexcel = XLSN.utils.sheet_to_json(workbook.Sheets[sheet])

      //borro la bd.
      await Objetives.collection.drop()

      //Consulto clientes
      let clientes = await Clients.where({ active: true })
      
      let obj_objetivos = []
      clientes.forEach(e => {
        dataexcel.forEach(f => {
          if(e.Codigo_Cliente === f.Codigo_Cliente){
            obj_objetivos.push(f)
          }
    
        })
      })*/

    //console.log(obj_objetivos)

    //Inserto xls en objetives
    //let result = await Objetives.insertMany(dataexcel)

    /*if (result) {

      //borro en survey datos de este año y mes
      await Survey.collection.drop()

      //selecciono de objetivos
      let objetives = Objetives.where({ active: true })

      let toInert = []
      objetives.forEach(e => {
        toInert.push({
          Codigo_Cliente: e.Codigo_Cliente,
          client_id: '',
          Nombre: { type: String },
          Vendedor: { type: Number },
          Merchandising: { type: Number },
          Mes: { type: Number, requerid: true },
          Año: { type: Number, requerid: true },
        })
      })

      let resultOfInsert = Survey.insertMany(objetivesToInsert)

    } else {
      console.log('Error in result...')
    }

    //let clientes = await Clients.where({active:true})



    if (result) {
      res.redirect('/upload-objetive')
    } else {
      console.log('Error in save Objetives...')
    }*/
    //}//end if 

  } catch (error) {
    console.log(error)
  }


})//end post

router.get('/api-objetivos', async (req, res) => {
  //traigo datos de la bd
  let objetivos = await Objetives.where({ active: true })

  let data = { data: objetivos }
  res.status(200).json(data)
})//end get

router.get('/api-admin-relevacion', async (req, res) => {
  //traigo datos de la bd
  let objetivos = await Survey.where({ active: true })

  //let data = { data: objetivos }
  res.status(200).json(data)
})//end get








//login
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
  passReqToCallback: true
}))//end post



function isKeyExists(obj, key) {
  return obj.hasOwnProperty(key);
}


module.exports = router