const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const objetives_schema = Schema({
    Codigo_Cliente: { type: String },
    Nombre: { type: String },
    Direccion: { type: String },
    Telefono: { type: String },
    Zona: { type: String },
    Localidad: {type: String},
    Provincia: {type: String},
    Pais:{type: String},
    Latitud:{type: Number},
    Longitud:{type: Number},
    Vendedor:{type: Number},
    Nombre_Vendedor:{type: String},
    Merchandising:{type: Number},
    Nombre_Merchandising:{type: String},
    Rubro:{type: String},
    Subrubro:{type: String},
    Mes:{type:Number,requerid:true},
    Año:{type:Number, requerid:true},
    Is_Objetive:{type:Boolean,requerid: true, default: false},
    Relevado:{type:Boolean, requerid: true, default: false },
    active:{ type: Boolean, requerid: true, default: true }

});

//Exporto modelo
module.exports = mongoose.model('objetives', objetives_schema);