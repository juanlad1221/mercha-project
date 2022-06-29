const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const area_schema = Schema({
    name_area: { type: String },
    motivo: [{name_motivo:{type:String}, active:{type:Boolean, default:true}}],
    active:{type:Boolean, default:true}
    
});

//Exporto modelo
module.exports = mongoose.model('area', area_schema);