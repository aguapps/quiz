var path = require('path');


// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite DATABASE_URL = sqlite://:@:/

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6] || null);
var user = (url[2] || null);
var pwd = (url[3] || null);
var protocol = (url[1] || null);
var dialect = (url[1] || null);
var port = (url[5] || null);
var host = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

// Cargar módulo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,{
  dialect: protocol,
  protocol: protocol,
  port: port,
  host: host,
  storage: storage,   // Solo SQLite (.env)
  omitNull: true      // Solo Postgres
});

//Importar la definición de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

//Importar la definición de la tabla Comment
var Comment = sequelize.import(path.join(__dirname,'comment'));
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz ;
exports.Comment = Comment;

// sequelize.sync() crea e inicializa la tabla de preguntas en DB
sequelize.sync().then(function(){
  // then(..) ejecuta el manejador una vez creada la tabla
  Quiz.count().then(function(count){
    if(count === 0){  // La tabla se inicializa si está vacia
      Quiz.create({pregunta: 'Capital de Italia',respuesta: 'Roma', tema: 'ocio'});
      Quiz.create({pregunta: 'Capital de Portugal',respuesta: 'Lisboa', tema: 'ocio'}).then(function(){console.log('Base de datos inicializada')});
    };
  });
});
