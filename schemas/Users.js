const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const users_schema = Schema({
    username: { type: String },
    password: { type: String, requerid: true },
    name: { type: String, requerid: true },
    phone: { type: String, requerid: true },
    type: { type: String, requerid: true },
    active: { type: Boolean, requerid: true, default: true }

});

//Exporto modelo
module.exports = mongoose.model('users', users_schema);