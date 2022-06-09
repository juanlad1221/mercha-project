const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const xls_schema = Schema({
    url: { type: String, requerid: true },
    type: { type: String, requerid: true },
    validated:{type: Boolean, default:false},
    error:{type: Boolean, default:false},
    processed:{type:Boolean, default:false}

});

//Exporto modelo
module.exports = mongoose.model('xls', xls_schema);