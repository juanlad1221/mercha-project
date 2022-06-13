const express = require("express");
const router = express.Router()
const passport = require('passport')
const multer = require('multer')
const path = require('path');
const XLSN = require('xlsx')
let bcrypt = require('bcryptjs')
var moment = require('moment'); // require
//const path = require('path')
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

router.get('/clientes-relevamientos:id', async (req, res) => {
  let id = req.params.id
  let user = req.user.name
  console.log(id)
  //traigo datos de la bd
  //let datos = await Survey.where({ Codigo_Cliente: String(1207) })
  //console.log(datos)
  res.render('../views/clientes_relevamientos', { user })
})




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
      let mes_solo = Number(moment(req.body.mes).format('MM'))
      var año_solo = moment(req.body.mes).format('YYYY');
      //let mes_solo = moment(req.body.mes).month() + 1
      switch (req.body.type) {
        case 'todos':
          let surveys = await Survey.where({ Año: año_solo, Mes: mes_solo })
          let merchas = await Users.where({ type: 'MERCHA' })
          let vendedores = await Users.where({ type: 'SELLER' })

          if (merchas && vendedores) {
            let arr = []
            //todos los usuarios
            let usuarios = merchas.concat(vendedores)

            usuarios.forEach(e => {
              let obj = {}
              obj.name = e.name
              obj.type = e.type
              obj.phone = e.phone
              obj.id = e.id
              obj.Date_ultimo = 'no data'
              /*let yu = await Survey.find({Merchandising:e.id}).sort({_id:'asc'})
              if(yu){
                if(yu[0].Date == null){
                  console.log('nulo')
                  obj.Date_ultimo = 'Sin Relevamiento'
                }else{
                  console.log('no nulo')
                  obj.Date_ultimo = e.Date
                }
                
                arr.push(obj)
              }*/

              arr.push(obj)
            })//end for

            /*arr.forEach(async e => {
              let yu = await Survey.find({Merchandising:e.id}).sort({_id:'asc'})
              if(yu){
                if(yu[0].Date == null){
                  console.log('nulo')
                  obj.Date_ultimo = 'Sin Relevamiento'
                }else{
                  console.log('no nulo')
                  obj.Date_ultimo = e.Date
                }
                
              }
            })//end for*/
          
            let data = { data: arr }
            res.status(200).json(data)
          }
          break
        case 'mercha':
          let surveyMercha = await Survey.where({ Año: year, Mes: mounth })
          let data_mercha = await Users.where({ type: 'MERCHA' })
         
          if (data_mercha) {
            let arr = []
            let usuarios = data_mercha

            usuarios.forEach(e => {
              let obj = {}
              obj.name = e.name
              obj.type = e.type
              obj.phone = e.phone
              obj.id = e.id
              obj.Date_ultimo = 'no data'
              /*let yu = await Survey.find({Merchandising:e.id}).sort({_id:'asc'})
              if(yu){
                if(yu[0].Date == null){
                  console.log('nulo')
                  obj.Date_ultimo = 'Sin Relevamiento'
                }else{
                  console.log('no nulo')
                  obj.Date_ultimo = e.Date
                }
                
                arr.push(obj)
              }*/

              arr.push(obj)
            })//end for

           
            console.log(arr)
            let data = { data: arr }
            res.status(200).json(data)
          }
          break
        case 'seller':
          console.log('9')
          break
      }
    }

    //let usuario = req.body.usuario
    //let date1 = String(req.body.mes + '-01')
    //let date2 = moment(date1).endOf('month').format('YYYY-MM-DD')
    //let mes_solo = moment(date1).format('MM')
    //console.log(req.body)
    //let survey = await Survey.where({Mes:Number(mes_solo)})
    //console.log(survey)
  }


  //let survey = await Survey.where({Date:{$gte:date1, $lte:date2}})

  //console.log(survey)
  //if(survey && clientes){


  /*arr.push({
    Codigo_Cliente: e.Codigo_Cliente,
    Date:e.Date,
    Nombre: e.Nombre,
    Direccion:e.Direccion,
    Telefono:e.Telefono,
    Zona:e.Zona,
    Localidad:e.Localidad,
    Provincia:e.Provincia,
    Nro:nro
  })*/



  //console.log(arr)
  //res.status(200).json(arr)

  //let data = { data: result } 
  //res.status(200).json(arr)
  //res.render('../views/administradorClientes', {user, data:result})
})//end











router.get('/msg-ok', (req, res) => {
  let user = req.user.name
  res.render('../views/msgOk', { user, title: 'Archivo eliminado correctamente' })
})//end get

router.get('/msg-error', (req, res) => {
  let user = req.user.name
  res.render('../views/msgError', { user, title: 'Archivo NO pudo eliminarse, intente nuevamente' })
})//end get

router.get('/msg-ok-upload', (req, res) => {
  let user = req.user.name
  res.render('../views/msgOkUpload', { user })
})//end get

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

/*router.post('/upload/xls-delete', async (req, res) => {
  const { client, objetive } = req.body

  if (client) {

    let result = await Xls.deleteOne({ type: 'CLIENTS' })

    if (result.deletedCount > 0) {
      res.redirect('/msg-ok')
    } else {
      console.log('Error en la eliminacion...')
      res.redirect('/msg-error')
    }
  }

  if (objetive) {
    let result = await Xls.deleteOne({ type: 'OBJETIVES' })
    console.log(result)
    if (result.deletedCount > 0) {
      res.redirect('/msg-ok')
    } else {
      console.log('Error en la eliminacion...')
      res.redirect('/msg-error')
    }
  }


})//end post*/

function isKeyExists(obj, key) {
  return obj.hasOwnProperty(key);
}


module.exports = router