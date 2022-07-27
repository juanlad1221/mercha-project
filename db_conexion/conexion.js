const mongoose = require('mongoose');


//------CONECTION DB MONGO ATLAS-------------------------------------------------------
/*mongoose.connect('mongodb+srv://juanlad1221:yonome1221@clustershool-widaw.mongodb.net/db_survey?retryWrites=true',{useUnifiedTopology: true, useNewUrlParser:true},(err, res)=>{
//mongoose.connect('mongodb://localhost/db_survey',{useNewUrlParser: true},(err, res)=>{
	if(err){console.log('Error: En consulta...',err)};
	console.log('Data Base ok...');
})*/


mongoose.connect('mongodb://admin:incubadora2022@164.92.118.90:27017/db_survey',{useNewUrlParser: true},(err, res)=>{
	if(err){console.log('Error: En consulta...',err)};
	console.log('Data Base ok...');
})

/*mongoose.connect('mongodb://localhost:27017/db_survey',{useNewUrlParser: true},(err, res)=>{
	if(err){console.log('Error: En consulta...',err)};
	console.log('Data Base ok...');
})*/