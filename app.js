var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');

var routes = require('./routes/index');
var tiempoMaximoMinutos = 2; //Tiempo de inactividad en minutos para el cierre de sesión
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('Quiz 2015')); //Semilla para cifrar las cookies
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

//Destruye sesion si ha pasado mas tiempo del establecido
app.use(function(req, res, next){
if ( req.session.user ){ // Si el usuario ha iniciado sesión
    if(req.session.tiempoSesion === undefined){  //Si aún no se le ha asignado tiempo
      req.session.tiempoSesion =Number(new Date()); //Asignamos el tiempo actual
    } else {
      if(req.session.tiempoSesion+(tiempoMaximoMinutos*60*1000)<Number(new Date())){ //Si ya se le había asignado el tiempo comprobamos que no hayan pasado los minutos
        delete req.session.user; // borra sesión usuario
        delete req.session.tiempoSesion // borra sesión tiempo
      } else {
        req.session.tiempoSesion =Number(new Date()); //Si hay actividad Asignamos el tiempo actual
      }
    }
} else {
  if(req.session.tiempoSesion){
    delete req.session.tiempoSesion;
  }
}
res.locals.session = req.session;
next();
});

//Helpers dinámicos
app.use(function(req,res,next){
  // guardar path en session.redr para después de login
  if(!req.path.match(/\/login|\/logout/)){
    req.session.redir = req.path;
  }
  //Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;
