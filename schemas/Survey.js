const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const survey_schema = Schema({
    Codigo_Cliente: { type: String },
    client_id:{type: Object},
    Nombre: { type: String },
    Vendedor:{type: Number},
    Merchandising:{type: Number},
    Mes:{type:Number,requerid:true},
    Año:{type:Number, requerid:true},
    Pictures:{type: Array},
    Status:{type: Boolean, requerid: true, default: false },
    active:{ type: Boolean, requerid: true, default: true }
});

//Exporto modelo
module.exports = mongoose.model('survey', survey_schema);