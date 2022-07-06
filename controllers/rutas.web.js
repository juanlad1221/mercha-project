const express = require("express");
const router = express.Router()
const passport = require('passport')
const multer = require('multer')
const path = require('path');
const XLSN = require('xlsx')
let bcrypt = require('bcryptjs')
let moment = require('moment');
const dayjs = require('dayjs')
let ObjectId = require('mongoose').Types.ObjectId;
const { base, objMes, relevados,
  getMerchaReleved, getSellerReleved,
  getDataMercha, filterByOneKey, filterByThreeKey,
  filterByFourKey, SortArrayDesc, filterByTwoKey,
  filterSpecial, filterCuntNoObjetive,filterByThreeKeyOR,
  filterByTwoKeyOR } = require('./utils/filters')
const isAuthenticated = require('./utils/isAutenticated')
const { storage, storagexls } = require('./utils/multer.config')

//models
const Users = require('../schemas/Users')
const Xls = require('../schemas/xls')
const Clients = require('../schemas/Clients')
const Objetives = require('../schemas/Objetives')
const Survey = require("../schemas/Survey")
const chats = require("../schemas/Chats");
const Chats = require("../schemas/Chats");
const Areas = require('../schemas/Area')
/*const { type } = require("os");
const { route } = require("./upload.movil.controller");
const { clearScreenDown } = require("readline");
const { collection } = require("../schemas/Users");
const e = require("express");*/

//Time
let currentTime = new Date();
let year = currentTime.getFullYear()
let mounth = currentTime.getMonth() + 1


router.get('', function (req, res) {
  res.render('../views/login')
})//end get


router.get('/dashboard', isAuthenticated, async function (req, res) {
  global.all_users = await Users.where({})
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


router.get('/validar-clientes', isAuthenticated, async (req, res) => {

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


router.get('/validar-objetivos', isAuthenticated, async (req, res) => {
  let update = await Xls.updateOne({ type: 'OBJETIVES' }, { validated: true })

  if (update.modifiedCount == 1) {
    res.redirect('load_objetivos')
  }
})//end get



//Cargo xls clientes en bd
router.get('/procesar-clientes', isAuthenticated, async (req, res) => {
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
router.get('/procesar-objetivos', isAuthenticated, async (req, res) => {
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

        //Borro por las dudas de survey lo q haya de objetivos para el mes y año.
        let status_delete = await Survey.deleteMany({ Año: year, Mes: mounth, Relevado: false })

        //Creo el array con 2 obj por cliente. uno mercha y otro seller
        let arr = []
        objetives.forEach(e => {
          let obj = {}
          let obj2 = {}

          obj.Codigo_Cliente = e.Codigo_Cliente
          obj.Nombre = e.Nombre
          obj.Direccion = e.Direccion
          obj.Telefono = e.Telefono
          obj.Zona = e.Zona
          obj.Localidad = e.Localidad
          obj.Provincia = e.Provincia
          obj.Mes = e.Mes
          obj.Año = e.Año
          obj.Vendedor = e.Vendedor
          obj.Nombre_Vendedor = e.Nombre_Vendedor
          obj.type = 'SELLER'
          obj.Pictures = []
          obj.Total_Pictures = 0
          obj.Msg = ''

          arr.push(obj)

          obj2.Codigo_Cliente = e.Codigo_Cliente
          obj2.Nombre = e.Nombre
          obj2.Direccion = e.Direccion
          obj2.Telefono = e.Telefono
          obj2.Zona = e.Zona
          obj2.Localidad = e.Localidad
          obj2.Provincia = e.Provincia
          obj2.Mes = e.Mes
          obj2.Año = e.Año
          obj2.Merchandising = e.Merchandising
          obj2.Nombre_Merchandising = e.Nombre_Vendedor
          obj2.type = 'MERCHA'
          obj2.Pictures = []
          obj2.Total_Pictures = 0
          obj2.Msg = ''

          arr.push(obj2)

        })//end
        
        //Inserto los objetivos del año y mes
        let status_insert_survey = await Survey.insertMany(arr)
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

router.get('/clientes', isAuthenticated, async (req, res) => {
  let user = req.user.name

  res.render('../views/clientes', { user })
})//end get

router.get('/objetivos', isAuthenticated, async (req, res) => {
  let user = req.user.name

  res.render('../views/objetivos', { user })
})//end get





//Relevamientos
router.get('/control-relevamientos', isAuthenticated, async (req, res) => {
  let user = req.user.name

  res.render('../views/control_relevamientos', { user })
})//end get

router.get('/clientes-relevamientos:id&:tipo', isAuthenticated, async (req, res) => {
  let id = req.params.id
  let tipo = req.params.tipo
  let user = req.user.name
  global.tipo = tipo
  global.id_usuario = id

  res.render('../views/clientes_relevamientos', { user, id, tipo })
})

router.get('/detalle-relevamiento:cliente&:fecha', isAuthenticated, async (req, res) => {
  try {
    let cliente = req.params.cliente
    let fecha = req.params.fecha
    let tipo = global.tipo
    let id_usuario = Number(global.id_usuario)
    let user = req.user.name

    const result = await Survey.where({ Codigo_Cliente: cliente })
    //consulto las fotos
    if (tipo == 'MERCHA') {

      //let result = await Survey.where({ Codigo_Cliente: cliente})

      let mercha = filterByFourKey('Merchandising', id_usuario, 'Date', fecha, 'type', 'MERCHA', 'Relevado', true, result)
      let data = filterByTwoKey('type', 'SELLER', 'Relevado', true, result)
      let seller = data.sort(SortArrayDesc)[0]

      let arr = []
      if (mercha.length > 0) {
        let dataMercha = {}
        dataMercha.fotos = mercha[0].Pictures,
          dataMercha.Nombre = mercha[0].Nombre_Merchandising,
          dataMercha.Id_cliente = mercha[0].Codigo_Cliente,
          dataMercha.Comercio = mercha[0].Nombre,
          dataMercha.Direccion = mercha[0].Direccion,
          dataMercha.Localidad = mercha[0].Localidad,
          dataMercha.Id_Mercha = mercha[0].Merchandising,
          dataMercha.Tipo = 'MERCHA',
          dataMercha.Nombre = mercha[0].Nombre_Merchandising,
          dataMercha.Date = mercha[0].Date,
          dataMercha.Msg = mercha[0].Msg

        arr.push(dataMercha)
      }

      if (data.length > 0) {
        let dataSeller = {
          fotos: seller.Pictures,
          Nombre: seller.Nombre,
          Id_cliente: seller.Codigo_Cliente,
          Comercio: seller.Nombre,
          Direccion: seller.Direccion,
          Localidad: seller.Localidad,
          Id_Vendedor: seller.Vendedor,
          Tipo: 'SELLER',
          Nombre: seller.Nombre_Vendedor,
          Date: seller.Date,
          Msg: seller.Msg
        }
        arr.push(dataSeller)
      } else {
        let dataSeller = {
          fotos: [],
          Nombre: 'no data',
          Id_cliente: 'no data',
          Comercio: 'no data',
          Direccion: 'no data',
          Localidad: 'no data',
          Id_Vendedor: 'no data',
          Tipo: 'no data',
          Nombre: 'no data',
          Date: 'no data',
          Msg: 'no data'
        }
        arr.push(dataSeller)
      }

      res.render('../views/detalle_relevamiento', { user, dataMercha: arr[0], dataSeller: arr[1] })

    }


    if (tipo == 'SELLER') {

      //let result = await Survey.where({ Codigo_Cliente: cliente, Relevado: true })

      let seller = filterByThreeKey('Vendedor', id_usuario, 'Date', fecha, 'type', 'SELLER', result)
      let data = filterByTwoKey('type', 'MERCHA', 'Relevado', true, result)
      let mercha = data.sort(SortArrayDesc)[0]

      let arr = []
      if (seller.length > 0) {
        let dataSeller = {}
        dataSeller.fotos = seller[0].Pictures,
          dataSeller.Nombre = seller[0].Nombre_Merchandising,
          dataSeller.Id_cliente = seller[0].Codigo_Cliente,
          dataSeller.Comercio = seller[0].Nombre,
          dataSeller.Direccion = seller[0].Direccion,
          dataSeller.Localidad = seller[0].Localidad,
          dataSeller.Id_Mercha = seller[0].Merchandising,
          dataSeller.Tipo = 'MERCHA',
          dataSeller.Nombre = seller[0].Nombre_Merchandising,
          dataSeller.Date = seller[0].Date,
          dataSeller.Msg = seller[0].Msg

        arr.push(dataSeller)
      }

      if (data.length > 0) {
        let dataMercha = {
          fotos: mercha.Pictures,
          Nombre: mercha.Nombre,
          Id_cliente: mercha.Codigo_Cliente,
          Comercio: mercha.Nombre,
          Direccion: mercha.Direccion,
          Localidad: mercha.Localidad,
          Id_Vendedor: mercha.Vendedor,
          Tipo: 'SELLER',
          Nombre: mercha.Nombre_Vendedor,
          Date: mercha.Date,
          Msg: mercha.Msg
        }
        arr.push(dataMercha)
      } else {
        let dataMercha = {
          fotos: [],
          Nombre: 'no data',
          Id_cliente: 'no data',
          Comercio: 'no data',
          Direccion: 'no data',
          Localidad: 'no data',
          Id_Vendedor: 'no data',
          Tipo: 'no data',
          Nombre: 'no data',
          Date: 'no data',
          Msg: 'no data'
        }
        arr.push(dataMercha)
      }

      res.render('../views/detalle_relevamiento', { user, dataMercha: arr[1], dataSeller: arr[0] })

    }


  } catch (error) {
    console.log(error)
  }
})//end get

router.get('/panel-relevamientos', isAuthenticated, async (req, res) => {
  let user = req.user.name
  let data = await Users.where({})
  let mercha_users = filterByOneKey('type', 'MERCHA', data)
  let seller_users = filterByOneKey('type', 'SELLER', data)

  res.render('../views/panel_relevamientos', { user, mercha_users, seller_users })
})//end get



//msg
router.get('/mensajes-detalle:chat', isAuthenticated, async (req, res) => {
  let user = req.user.name
  let user_id = req.user.id
  let id_chat = req.params.chat

  let data = await Chats.findOne({_id:ObjectId(id_chat)})
  if(data){
    data.Mensajes.forEach(e =>{
      if(!e.leido){
        e.leido = true
      }
    })//end
    data.save()
  }
  
    res.render('../views/msg_detalle', { user,id_chat,data, user_id })
})//end get

router.get('/mensajes', isAuthenticated, async (req, res) => {
  let user = req.user.name
  //console.log(user)
  res.render('../views/dashboard_msj', { user })
})//end get

router.post('/api-chat', isAuthenticated, async (req, res) => {
if(req.body){
  let id = req.body.id_chat

  let data = await Chats.findOne({_id:ObjectId(id)})
  if(data){
    res.status(200).json(data)
  }
}
  console.log(req.body)
})//end get

router.post('/mensaje-nuevo', isAuthenticated, async (req, res) => {
  try {
    if (req.body) {
      let Codigo_Cliente = req.body.codigo_cliente
      let Nombre = req.body.nombre
      let Type_user_destino = req.body.type_user_destino
      let User_id_destino = req.body.user_id_destino
      let Motivo = req.body.motivo
      let Motivo_id = req.body.motivo_id
      let Area = ''
      let Area_id = req.body.area_id
      let User_id_emisor = req.body.user_id_emisor
      let Type_user_emisor = req.body.type_user_emisor
      
      //msg obj para almacenar
      let obj = {
        Codigo_Cliente,
        Nombre,
        Type_user_destino,
        User_id_destino,
        Motivo,
        Motivo_id,
        Area,
        Area_id,
        User_id_emisor,
        Type_user_emisor,
        status: 'pendiente',
        Date: new Date(),
        Mensajes: req.body.msg 
      }
      
      let result = await Chats.where({})
      if (result) {
        let existe_pen = filterByFourKey('Codigo_Cliente', Codigo_Cliente, 'User_id_destino', User_id_destino, 'User_id_emisor', User_id_emisor, 'status', 'pendiente', result).length
        let existe_act = filterByFourKey('Codigo_Cliente', Codigo_Cliente, 'User_id_destino', User_id_destino, 'User_id_emisor', User_id_emisor, 'status', 'activo', result).length

        if (existe_pen == 0 && existe_act == 0) {
          nuevoChat = await Chats.create(obj)
          console.log('Se grabó nuevo correctamente...')
          res.status(200).json({ status: 200 })
        } else {
          console.log('ya existe el chat...')
          res.status(400).json({ status: 400 })
        }
      }
      //console.log(existe_act,'jjjj')

    }//ens body
  } catch (error) {
    console.log('Error in post: /mensaje-nuevo...')
  }
})//end post

router.post('/update-msg',async (req, res) => {
  
    if (req.body) {
      let obj = req.body
      let area = await Areas.findOne({_id:ObjectId(req.body.Area_id)})
      let user_ = await Users.findOne({id:Number(obj.User_id_emisor)})
     
      if(area && user_){
        obj.Area = area.name_area
        obj.Date = new Date()
        
        //encuentro el chat
        let result = await Chats.findOne({_id:ObjectId(obj.id_chat)})
        if(result.status == 'terminado'){
          console.log('ERROR: chat terminado...')
          res.status(400).json({ status: 400 })
        }

        result.status = obj.status
        result.Mensajes.push({msg:obj.msg,type:obj.Type_user_emisor, name:user_.name})
        result.save()
        console.log('Se grabó nuevo correctamente...')
        res.status(200).json({ status: 200 })
      }//area
    }//body
})//end post




//apis internas tablas
router.get('/api-clientes', isAuthenticated, async (req, res) => {
  //traigo datos de la bd
  let clientes = await Clients.where({ active: true })

  let data = { data: clientes }
  res.status(200).json(data)
})//end get

router.get('/api-objetivos', isAuthenticated, async (req, res) => {
  //traigo datos de la bd
  let objetivos = await Objetives.where({ active: true })

  let data = { data: objetivos }
  res.status(200).json(data)
})//end get

router.get('/api-msg', async (req, res) => {
  try {
    let msg = await Chats.where({})

    let yu = filterByThreeKeyOR('status', 'pendiente','status','activo','status','terminado', msg)
    let arr=[]
    //console.log(yu)
    yu.forEach(e => {
      let obj = {}
      obj._id = e._id
      obj.Codigo_Cliente= e.Codigo_Cliente
      obj.Nombre = e.Nombre
      obj.Type_user_destino = e.Type_user_destino
      obj.User_id_destino = e.User_id_destino
      obj.Motivo = e.Motivo
      obj.Motivo_id = e.Motivo_id
      obj.Area = e.Area
      obj.Area_id = e.Area_id
      obj.Type_user_emisor = e.Type_user_emisor
      obj.User_id_emisor = e.User_id_emisor
      obj.Date = e.Date
      obj.status = e.status
      if(obj.cant_msg != 0){
        let yu = filterByOneKey('leido', false, e.Mensajes)
        let cant = filterByTwoKeyOR('type', 'MERCHA','type','SELLER' ,yu).length
        if(cant != 0){
          obj.cant_msg = cant
        }else{
          obj.cant_msg = 0
        }      
      }
      arr.push(obj)
    })
   
    let data = { data: arr }
    res.status(200).json(data)
  } catch (error) {
    console.log('error in /api-msg...')
  }
})//end get

router.post('/api-select', isAuthenticated, async (req, res) => {
  let data = await Users.where({ type: req.body.type })

  res.status(200).json(data)
})//end post

router.post('/api-select-2', isAuthenticated, async (req, res) => {
  let data = await Clients.where({}).sort({ Nombre: 1 })

  if (req.body.tipo == 'MERCHA') {
    let data_ = filterByOneKey('Merchandising', Number(req.body.id), data)

    if (data_) {
      res.status(200).json(data_)
    }
  }

  if (req.body.tipo == 'SELLER') {
    //let data = await Clients.where({type:req.body.tipo, Vendedor:Number(req.body.id)})
    let data_ = filterByOneKey('Vendedor', Number(req.body.id), data)
    if (data_) {
      res.status(200).json(data_)
    }
  }

})//end post

router.get('/api-select-3', isAuthenticated, async (req, res) => {
  let data = await Areas.where({})
  if (data) {
    let arr = []

    data.forEach(e => {
      e.motivo.forEach(f => {
        let obj = {}
        obj.name_motivo = f.name_motivo
        obj.area_id = e._id
        obj.name_area = e.name_area
        arr.push(obj)
      })
    })
    res.status(200).json(arr)
  }

})//end get







router.get('/apis', async (req, res) => {
  let data = new Areas({ name_area: 'Productos' })
  data.save()
  data.motivo.push({ name_motivo: 'Producto Defectuoso' }, { name_motivo: 'Calidad' })

})//end 








/*router.get('/api-gestion', isAuthenticated, async (req, res) => {
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
})//end get*/





router.post('/api-relevamientos', isAuthenticated, async (req, res) => {
  if (req.body) {
    console.log(req.body)
    if (req.body.mes) {
      let año_solo = new Date(req.body.mes).getFullYear()
      let oneDate = moment(req.body.mes, 'DD-MM-YYYY')
      let mes_solo = Number(oneDate.format('MM'))

      let fecha = new Date(req.body.mes)
      let f1 = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
      let f3 = new Date(new Date(req.body.mes).getFullYear(), new Date(req.body.mes).getMonth() + 2, 0).getDate()
      let f2 = new Date(año_solo, (mes_solo - 1),f3)
      
      let surveys = await Survey.where({ Año: año_solo, Mes: mes_solo })
      let noObjetive = await Survey.where({ Año: null, Mes: null })
     
      switch (req.body.type) {
        case 'todos':
          //let surveys = await Survey.where({ Año: año_solo, Mes: mes_solo })
          let all_users = global.all_users
        
          if (all_users && surveys) {
            let arr = []

            all_users.forEach(e => {
              if (e.type != 'ADMIN') {
                let obj = {}
                obj.id = e.id
                obj.Date_ultimo = 'no data'
                obj.name = e.name
                obj.type = e.type

                //ultima fecha
                if (e.type == 'MERCHA') {
                  let list = getMerchaReleved(e.id, surveys)
                  if (list.length > 0) {
                    obj.Date_ultimo = list.sort((a, b) => {
                      if (a.Date > b.Date) { return -1 };
                      if (a.Date < b.Date) { return 1 };
                      return 0;
                    })[0].Date
                  } else {
                    obj.Date_ultimo = 'no data'
                  }
                  //total base
                  obj.total_base = base(e.id, surveys)
                  //obj mes
                  let objm = objMes(e.id, año_solo, mes_solo, surveys)
                  obj.obj_mes = objm
                  //relevados
                  let rel = relevados(e.id, año_solo, mes_solo, true, surveys)
                  obj.relevados = rel
                  //%
                  obj.porcentaje = Math.round((100 * rel) / objm) || 0
                  //no objetivos
                  obj.no_objetive = filterCuntNoObjetive('type', 'MERCHA', 'Merchandising', Number(e.id), 'Relevado', true, 'createdAt', f1, 'createdAt', f2, noObjetive).length  
                }
                
                //fecha ultima
                if (e.type == 'SELLER') {
                  let lista = getSellerReleved(e.id, surveys)
                  if (lista.length > 0) {
                    obj.Date_ultimo = lista.sort((a, b) => {
                      if (a.Date > b.Date) { return -1 }
                      if (a.Date < b.Date) { return 1 }
                      return 0
                    })[0].Date
                  } else {
                    obj.Date_ultimo = 'no data'
                  }

                  //total base
                  obj.total_base = filterByOneKey('Vendedor', e.id, surveys).length
                  //obj mes
                  let objm = filterByThreeKey('Vendedor', e.id, 'Año', año_solo, 'Mes', mes_solo, surveys).length
                  obj.obj_mes = objm
                  //relevados
                  let rel = filterByFourKey('Vendedor', e.id, 'Año', año_solo, 'Mes', mes_solo, 'Relevado', true, surveys).length
                  obj.relevados = rel
                  //%
                  obj.porcentaje = Math.round((100 * rel) / objm) || 0
                  //no objetivos
                  obj.no_objetive = filterCuntNoObjetive('type', 'SELLER', 'Vendedor', e.id, 'Relevado', true, 'createdAt', f1, 'createdAt', f2, noObjetive).length
                }

                arr.push(obj)
              }
            })//end for

            let data = { data: arr }
            res.status(200).json(data)
          }
          break
        case 'mercha':
          let survey_mercha = surveys 
          let all_users_mercha = filterByOneKey('type','MERCHA',global.all_users)

          if (all_users_mercha && survey_mercha) {
            let arr2 = []

            all_users_mercha.forEach(e => {
              if (e.type != 'ADMIN') {
                let obj = {}
                obj.id = e.id
                obj.Date_ultimo = 'no data'
                obj.name = e.name
                obj.type = e.type

                if (e.type == 'MERCHA') {
                  let list = getMerchaReleved(e.id, survey_mercha)
                  if (list.length > 0) {
                    obj.Date_ultimo = list.sort((a, b) => {
                      if (a.Date > b.Date) { return -1 };
                      if (a.Date < b.Date) { return 1 };
                      return 0;
                    })[0].Date
                  } else {
                    obj.Date_ultimo = 'no data'
                  }
                }

                obj.total_base = base(e.id, survey_mercha)
                let objm = objMes(e.id, año_solo, mes_solo, survey_mercha)
                obj.obj_mes = objm
                let rel = relevados(e.id, año_solo, mes_solo, true, survey_mercha)
                obj.relevados = rel
                obj.porcentaje = Math.round((100 * rel) / objm) || 0
                obj.no_objetive = filterCuntNoObjetive('type', 'MERCHA', 'Merchandising', e.id, 'Relevado', true, 'createdAt', f1, 'createdAt', f2, noObjetive).length
                arr2.push(obj)
              }
            })//end for

            let data = { data: arr2 }
            res.status(200).json(data)
          }
          break
        case 'seller':
          let survey_seller = surveys
          let all_users_seller = filterByOneKey('type','SELLER',global.all_users)

          if (all_users_seller && survey_seller) {
            let arr3 = []

            all_users_seller.forEach(e => {
              if (e.type != 'ADMIN') {
                let obj = {}
                obj.id = e.id
                obj.Date_ultimo = 'no data'
                obj.name = e.name
                obj.type = e.type

                if (e.type == 'SELLER') {
                  let lista = getSellerReleved(e.id, survey_seller)
                  if (lista.length > 0) {
                    obj.Date_ultimo = lista.sort((a, b) => {
                      if (a.Date > b.Date) { return -1 }
                      if (a.Date < b.Date) { return 1 }
                      return 0
                    })[0].Date
                  } else {
                    obj.Date_ultimo = 'no data'
                  }
                }

                obj.total_base = filterByOneKey('Vendedor', e.id, survey_seller).length
                let objm = filterByThreeKey('Vendedor', e.id, 'Año', año_solo, 'Mes', mes_solo, survey_seller).length
                obj.obj_mes = objm
                let rel = filterByFourKey('Vendedor', e.id, 'Año', año_solo, 'Mes', mes_solo, 'Relevado', true, survey_seller).length
                obj.relevados = rel
                obj.porcentaje = Math.round((100 * rel) / objm) || 0
                obj.no_objetive = filterCuntNoObjetive('type', 'SELLER', 'Vendedor', e.id, 'Relevado', true, 'createdAt', f1, 'createdAt', f2, noObjetive).length
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


router.post('/api-clientes-relevamietos', isAuthenticated, async (req, res) => {

  if (req.body) {
    console.log(req.body)
    if (req.body.mes) {
      //obtengo los datos
      let año_solo = new Date(req.body.mes).getFullYear()
      let oneDate = moment(req.body.mes, 'DD-MM-YYYY')
      let mes_solo = Number(oneDate.format('MM'))
      let user = Number(req.body.idUser)
      let type_user = req.body.typeUser

      const data = await Survey.where({ Año: año_solo, Mes: mes_solo })

      switch (req.body.type) {
        case 'todos':
          if (type_user == 'MERCHA') {
            let surveyAll = filterByTwoKey('Merchandising', user, 'type', 'MERCHA', data)//await Survey.where({ Merchandising: user, type: 'MERCHA', Año: año_solo, Mes: mes_solo })
            let arr = []

            if (surveyAll) {
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
          if (type_user == 'SELLER') {
            let sellerAll = filterByTwoKey('Vendedor', user, 'type', 'SELLER', data)//await Survey.where({ Vendedor: user, type: 'SELLER', Año: año_solo, Mes: mes_solo })
            let arr = []

            if (sellerAll) {
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
          if (type_user == 'MERCHA') {
            let surveyAll = filterByThreeKey('Merchandising', user, 'type', 'MERCHA', 'Relevado', true, data) //await Survey.where({ Merchandising: user, type: 'MERCHA', Año: año_solo, Mes: mes_solo, Relevado: true })
            let arr = []

            if (surveyAll) {
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

          if (type_user == 'SELLER') {
            let sellerAll = filterByThreeKey('Vendedor', user, 'type', 'SELLER', 'Relevado', true, data)//await Survey.where({ Vendedor: user, type: 'SELLER', Año: año_solo, Mes: mes_solo, Relevado: true })
            let arr = []

            if (sellerAll) {
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
          if (type_user == 'MERCHA') {
            let surveyAll = filterByThreeKey('Merchandising', user, 'type', 'MERCHA', 'Relevado', false, data)//await Survey.where({ Merchandising: user, type: 'MERCHA', Año: año_solo, Mes: mes_solo, Relevado: false })
            let arr = []

            if (surveyAll) {
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

          if (type_user == 'SELLER') {
            let sellerAll = filterByThreeKey('Vendedor', user, 'type', 'SELLER', 'Relevado', false, data)//await Survey.where({ Vendedor: user, type: 'SELLER', Año: año_solo, Mes: mes_solo, Relevado: false })
            let arr = []

            if (sellerAll) {
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


router.post('/consulta-relevamiento', async (req, res) => {
  //obtengo los datos
  try {
    if (req.body) {
      let today = new Date(req.body.fecha)
      let lastDay = new Date(today.getFullYear(), (today.getMonth() + 2), 0).getDate()

      let fecha2 = new Date(today.getFullYear() + '-' + completeDate(today.getMonth() + 2) + '-' + lastDay)
      let fecha = today
      let user_id = Number(req.body.user_id)
      let typeUser = req.body.typeUser
      //console.log(req.body)
      let data_ = await Survey.where({ Relevado: true })

      if (data_) {
        if (typeUser == 'MERCHA') {
          //aplico filtros
          let data_mercha = filterByTwoKey('type', typeUser, 'Merchandising', user_id, data_)
          //aplico filtro sobre el date
          let dataToSend = filterSpecial(data_mercha, fecha, fecha2, typeUser)

          let data = { data: dataToSend }
          res.status(200).json(data)
        } else {
          //aplico filtros
          let data_seller = filterByTwoKey('type', typeUser, 'Vendedor', user_id, data_)
          //aplico filtro sobre el date
          let dataToSend = filterSpecial(data_seller, fecha, fecha2, typeUser)

          let data = { data: dataToSend }
          res.status(200).json(data)
        }
      }
    }//if body
  } catch (error) {
    console.log('Error in try catch... url:/consulta-relevamiento')
  }

})//end post











router.get('/download/clientes', isAuthenticated, async (req, res) => {
  let xls = await Xls.where({ type: 'CLIENTS' })

  res.status(200).download(xls[0].url)
})//end get

router.get('/download/objetivos', isAuthenticated, async (req, res) => {
  let xls = await Xls.where({ type: 'OBJETIVES' })

  res.status(200).download(xls[0].url)
})//end get





//Upload clientes
const upload = multer({ storage: storagexls })
router.post('/upload/clientes', isAuthenticated, upload.single('file'), async (req, res) => {

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
router.post('/upload/objetives', isAuthenticated, upload.single('file'), async (req, res) => {

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

/*router.get('/api-objetivos', async (req, res) => {
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
})//end get*/








//login
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
  passReqToCallback: true
}))//end post



function isKeyExists(obj, key) {
  return obj.hasOwnProperty(key);
}
function completeDate(num) {
  if (num == 10 || num == 11 || num == 12) {
    return num
  }
  return String('0' + num)
}


module.exports = router