const express = require('express')
const path = require('path');
const cors = require('cors')
const passport = require('passport');
let session = require('express-session')
const prismaClient = require('@prisma/client')

const app = express()
// PASSPORT
require('./passport/passport');


//Config
app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended:true, limit: '50mb'}))
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'yonome1221',
    cookie: {
    maxAge: (1000 * 60 *60)
    },
    resave: false,
    saveUninitialized: false
  }))

//Passport
app.use(passport.initialize());
app.use(passport.session());




//rutas movil
app.use('/api', require('./controllers/auth.movil.controller'))
app.use('/api', require('./controllers/register.controller'))
app.use('/api', require('./controllers/allListUser.movil.controller'))
app.use('/api', require('./controllers/upload.movil.controller'))
app.use('/api', require('./controllers/merchalist.movil.controller'))
app.use('/api', require('./controllers/list.movil.controller'))
app.use('/api', require('./controllers/msg.controller'))
app.use('/api', require('./controllers/msg.update.controller'))
//rutas web
app.use('/', require('./controllers/rutas.web'))


//Conexion BD
require('./db_conexion/conexion');



//Server
app.set('port', process.env.PORT || 3001);
app.listen(app.get('port'), () => {
    console.log(`Server corriendo en ${app.get('port')}...`)

})