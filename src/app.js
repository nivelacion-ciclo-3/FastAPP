const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');

const app = express();

//Configuraciones iniciales
app.set('port', 7000);
app.set('views', 'src/vistas');
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//Conectores
app.use(morgan('dev'));

//Rutas
app.use(require('./rutas/productos'));


//Exportar el módulo
module.exports = app;