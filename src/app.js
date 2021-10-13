const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');

const { estaLogueado, noEstaLogueado } = require('./rutas/auth');


const app = express();


const session = require('express-session');

//Configuraciones iniciales
app.set('port', 7000);
app.set('views', path.join(__dirname, 'vistas'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//routes files and css
app.use(express.static('.'));
app.set(express.static(path.join(__dirname, 'publico')));

//Sesion
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SecretCode2021*'
}));



//Conectores
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: false
}));

//Rutas
app.use(require('./rutas/productos'));
app.use(require('./rutas/login'));
app.use(require('./rutas/usuarios'));

/*  PASSPORT SETUP  */
const passport = require('passport');
const googleid = require('./googleid');
const GoogleStrategy = require('passport-google-oauth2');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: googleid.GOOGLE_CLIENT_ID,
    clientSecret: googleid.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:7000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

//Envío referencia login para evitar el navbar
const refLogin = "Página Lógin";

//Listar Productos y será la raíz donde redirije al autenticar
const db = require('./keysfirebase');
app.get('/', estaLogueado, (req, res) => {
    //res.send('Listado de productos, configurar la vista');
    db.ref('productos').orderByChild('estado').equalTo("Activo").once('value', (snapshot) => {
        const data = snapshot.val();
        res.render('productos/listadoProductos', { productos: data, usuario: userProfile });
        console.log('Datos desede la bd --> ', data);
    });
    
});
    
//Error de autenticación
app.get('/error', (req, res) => res.send("error logging in"));

//LLamada a login con google
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));

//Respuesta a login con google
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/');
  });

  //Logout
app.get('/logout', estaLogueado, (req, res) => {
        req.logOut();
        res.redirect('/login');
    });

//Exportar el módulo
module.exports = app;