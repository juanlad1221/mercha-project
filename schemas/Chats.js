const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const chat_schema = Schema({
    Codigo_Cliente: { type: String },
    Nombre: { type: String },
    Direccion: { type: String },
    Type_user_destino: { type: String },
    User_id_destino: { type: String },
    Motivo:{type:String},
    Motivo_id:{type:Object},
    Area:{type:String},
    Area_id:{type:Object},
    Type_user_emisor:{type:String}, 
    User_id_emisor:{type:String},
    Date:{type:Date},
    Asunto:{type:String}
    status:{type:String},
    Mensajes:[{msg:{type:String}, Date_msg:{type:Date}, 
        leido:{type:Boolean, default:false}, name:{type:String}, 
        type:{type:String}}]
});

//Exporto modelo
module.exports = mongoose.model('chat', chat_schema);