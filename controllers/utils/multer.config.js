const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}` + `${file.originalname}`)
    }
  })

  const storagexls = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/xls')
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}` + `${file.originalname}`)
    }
  })

  /*const storagexls_user = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/xls')
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}` + `${file.originalname}`)
    }
  })*/
  

module.exports = {storage, storagexls}