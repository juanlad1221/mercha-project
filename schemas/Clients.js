const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const clients_schema = Schema({
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
    Merchandising:{type: Number},
    Rubro:{type: String},
    Subrubro:{type: String},
    On_survey:{type:Boolean, requerid: true, default: false },
    active:{ type: Boolean, requerid: true, default: true }

});

//Exporto modelo
module.exports = mongoose.model('clients', clients_schema);