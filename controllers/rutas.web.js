const express = require("express");
const router = express.Router()
const passport = require('passport')
const multer = require('multer')
const path = require('path');
const XLSN = require('xlsx')
let bcrypt = require('bcryptjs')
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
      res.render('../views/upload_clientes', { user, flag: true, validated: xls[0].validated, processed: xls[0].processed })
    } else {
      res.render('../views/upload_clientes', { user, flag: false, validated: false, processed: false })
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
    let update = await Xls.updateOne({ type: 'CLIENTS' }, { validated: true })
    
    if (update.modifiedCount == 1) {
      res.redirect('load_clientes')
    }
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

      //borro la bd.
      await Clients.collection.drop()

      //inserto clientes xls en la bd
      let insert =await Clients.insertMany(dataexcel)
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
    //let user = req.user.name
    //traigo la url de objetivos
    let url = await Xls.findOne({ type: 'OBJETIVES' })

    if (url.type === 'OBJETIVES') {
      const workbook = XLSN.readFile(url.url)
      const workbookSheet = workbook.SheetNames
      let sheet = workbookSheet[0]
      const dataexcel = XLSN.utils.sheet_to_json(workbook.Sheets[sheet])

      //borro objetivos de la bd.
      await Objetives.collection.drop()

      //inserto xls objetivos en bd
      let status_insert = await Objetives.insertMany(dataexcel)
      if (status_insert) {
        //traigo los objetivos del mes a insertar en survey
        let objetives = await Objetives.where({ Año: year, Mes: mounth })

        //Borro por las dudas de survey lo q haya de objetivos para el mes.
        let status_delete = await Survey.deleteMany({ Año: year, Mes: mounth })

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

  res.render('../views/objetivos', {user})
})//end get


//apis internas
router.get('/api-clientes', async (req, res) => {
  //traigo datos de la bd
  let clientes = await Clients.where({active:true})

  let data = {data:clientes}
  res.status(200).json(data)
})//end get

router.get('/api-objetivos', async (req, res) => {
  //traigo datos de la bd
  let objetivos = await Objetives.where({active:true})

  let data = {data:objetivos}
  res.status(200).json(data)
})//end get







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

router.get('/download/clientes',async (req, res) => {
  let xls = await Xls.where({type: 'CLIENTS'})

  res.status(200).download(xls[0].url)
})//end get

router.get('/download/objetivos',async (req, res) => {
  let xls = await Xls.where({type: 'OBJETIVES'})
 
  res.status(200).download(xls[0].url)
})//end get





//Upload clientes
const upload = multer({ storage: storagexls })
router.post('/upload/clientes', upload.single('file'), async (req, res) => {

  try {
    //inserto nvo documneto CLIENTS
    let obj = {
      url: req.file.path,
      type: 'CLIENTS'
    }

    let status_delete = await Xls.deleteOne({ type: 'CLIENTS' })
    console.log(status_delete)
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

//upload users
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

//login
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
  passReqToCallback: true
}))//end post

router.post('/upload/xls-delete', async (req, res) => {
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


})//end post


module.exports = router