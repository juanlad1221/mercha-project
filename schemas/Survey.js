const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const survey_schema = Schema({
    Codigo_Cliente: { type: String },
    client_id:{type: Object},
    Nombre: { type: String  },
    Direccion: { type: String },
    Telefono: { type: String },
    Zona: { type: String },
    Localidad: {type: String},
    Provincia: {type: String},
    Vendedor:{type: Number},
    Nombre_Vendedor:{type: String},
    Merchandising:{type: Number},
    Nombre_Merchandising:{type: String},
    Mes:{type:Number},
    Año:{type:Number},
    Date:{type:String, requerid:true,default:null},
    Pictures:[],
    Total_Pictures:{type:Number, default:0},
    Msg:{String},
    Relevado:{type:Boolean, requerid: true, default: false },
    active:{ type: Boolean, requerid: true, default: true }
});

//Exporto modelo
module.exports = mongoose.model('survey', survey_schema);