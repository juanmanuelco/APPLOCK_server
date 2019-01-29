//Establecemos la crecaión del servidor de elementos__________________________________________________________________________________________
cookieParser = require('cookie-parser')
bodyParser = require('body-parser')
path = require('path')

express = require('express')
exphbs = require('express-handlebars')
flash = require('connect-flash')
mongoose = require('mongoose')

servidor = express()
puerto = 3000
http = require('http').Server(servidor)
port = process.env.PORT || puerto

////=======================descomentar la linea de abajo para conectar a la base de datos ======================//
mongoose.connect(`mongodb://Admin:Abc123.....@ds151864.mlab.com:51864/applock`, 
                    { server: { reconnectTries: Number.MAX_VALUE } });


//Establecemos las rutas para cada uso
rutaIndex = require('./rutas/index')
rutaUsuario = require('./rutas/usuarios')

//Definimos que se usará tecnología hbs para modificar la vista de una página
servidor.set('views', path.join(__dirname, 'views'));

//La página estática sirve para reciclar elementos
servidor.engine('handlebars', exphbs({ defaultLayout: 'estatico' }));
servidor.set('view engine', 'handlebars');

//Permitimos el reconocimiento de JSON en el sistema 
servidor.use(bodyParser.json());
servidor.use(bodyParser.urlencoded({ extended: false }));
servidor.use(cookieParser());

//Es necesario el poder enviar mensajes automáticos desde el servidor
servidor.use(flash());


//Aqui se define donde estarán los estilos y scripts tanto globales como modulares
servidor.use(express.static(path.join(__dirname, 'recursos')));

//usamos las rutas creadas anteriormente
servidor.use('/', rutaIndex)
servidor.use('/usuario', rutaUsuario)

//Controlamos el error de página no encontrada
servidor.use((req, res) => { res.status('404'); res.send('E9') });

//Controlamos el error de fallos en el servidor
servidor.use((err, req, res, next) => { res.status(500); console.log(err); res.send('E10') });

//Inicializamos el servidor
http.listen(port);
console.log('Funcionando')
