express = require('express');
router = express.Router();

User = require('../modelos/usuarios')
Hijos = require('../modelos/hijos')
Apps = require('../modelos/Apps')
cadena = require('../rutas/funciones')
TEST = require('../modelos/test')
emailjs = require('emailjs-com')
emailjs.init('user_ZzaWVnStQOMUVgIH8Uu9U');

url = 'http://10.24.9.65:3000'

router.get('/', (req, res) => {
    res.send('Este es el servidor')
})

router.post('/registro', (req, res) => {
    //Busco si el usuario no existe
    User.findOne().where({ mail: req.body.mail }).exec((error, resp) => {
        if (resp == null) {
            //Establezco los valores a ingresar del usuario
            Identidad = Date.now();
            Token = cadena.token;
            nuevoUsuario = new User({
                identidad: Identidad,
                mail: req.body.mail,
                pass: req.body.pass,
                estado: false,
                token: Token
            })
            //Guardo el usuario
            nuevoUsuario.save((error, respuesta) => {
                if (error) console.log(error)
                else console.log(respuesta)
                //Creo una instancia del api de envio de correo
                var p = {
                    destino: req.body.mail,
                    titulo: 'Registro',
                    nombre: req.body.mail,
                    mensaje: 'Use el siguiente link para activar tu cuenta',
                    link_t: 'Activación',
                    link: `${url}/usuario/activar:${Identidad}-${Token}`,
                };
                //Envio el correo de activacion
                emailjs.send('gmail', 'template_JEaIsiId', p)
                    .then(function (response) {
                        console.log('SUCCESS!', response.status, response.text);
                        res.send('OK')
                    }, function (error) {
                        console.log('FAILED...', error);
                        res.send('E1')
                    });
            })
        } else {
            res.send('E3')
        }
    })
})

router.get('/activar:parametro', (req, res) => {

    //Obtengo el parametro de la url
    var identificacion = (req.params.parametro).substr(1, req.params.parametro.length)
    identificacion = identificacion.split('-')
    //Pregunto si existe una cuenta con ese id y ese token
    User.findOne().where({ identidad: identificacion[0], token: identificacion[1] }).exec((error, resp) => {
        if (resp != null) {
            //Actualizao el token para que a cuenta se mueste como activa
            User.findOneAndUpdate({ identidad: identificacion }, { token: cadena.token, estado: true }, (error, resp) => {
                if (error) res.send('E1');
                else res.send('Cuenta activada con éxito')
            })
        } else res.send('No existe esta cuenta o ya se encuentra activa')
    })
})

router.get('/recuperar:parametro', (req,res)=>{
    var identificacion = (req.params.parametro).substr(1, req.params.parametro.length)
    identificacion = identificacion.split('-')
    User.findOne().where({identidad: identificacion[0], token: identificacion[1]}).exec((error, resp)=>{
        User.findOneAndUpdate({identidad: identificacion[0]},{token: cadena.token}).exec((e, result)=>{
            res.send('Su contraseña es '+ resp.pass)
        })
    })
})

router.post('/login', (req, res) => {
    //Busca un usuario con ese mail y contraseña
    User.findOne().where({ mail: req.body.mail, pass: req.body.pass, estado: true }).exec((error, resp) => {
        if (error) res.send('E1')
        else {
            //Si encuentra aceta la sesion
            if (resp != null) res.send('OK')
            else res.send('E4')
        }
    })
})
router.post('/hijos', (req, res) => {
    nuevoHijo = new Hijos({
        codigo: req.body.nuevo_usuario,
        padre: req.body.padre,
        estado: 'Sin usar'
    })
    nuevoHijo.save((error, listo) => {
        res.send('OK')
    })
})

router.post('/hijos_todos', (req, res) => {
    var respuesta = new Array()
    Hijos.find().where({ 'padre': req.body.padre }).exec((error, resp) => {
        console.log(resp)
        respuesta.concat(resp)
        res.send(resp)
    })
})

router.post('/hijo_uso', (req, res) => {
    Hijos.findOne().where({ codigo: req.body.usuario }).exec((e, resp) => {
        if (resp == null) res.send('no existe')
        else res.send('existe')
    })
})

router.post('/integrar', (req, res) => {
    Hijos.findOne().where({ codigo: req.body.usuario }).exec((e, resp) => {
        if (resp == null) res.send('E1')
        else {
            if (resp.estado == 'En uso') res.send('E2')
            else {
                Hijos.findOneAndUpdate({ codigo: req.body.usuario }, { estado: 'En uso' }, (e, resp) => {
                    User.findOne().where({ mail: resp.padre }).exec((e, resp) => {
                        console.log(resp)
                        res.send('A' + resp.pass)
                    })
                })
            }
        }
    })
})

router.post('/desboqueo', (req, res) => {
    console.log('-----------------------------------------')
    console.log(req.body)
    Hijos.findOne().where({ codigo: req.body.usuario }).exec((e, resp) => {
        console.log(resp)
        if (e) res.send('E1')
        else {
            if (resp == null) res.send('E2')
            else {
                User.findOne().where({ mail: resp.padre }).exec((e, respu) => {
                    console.log(respu)
                    if (e) res.send('E1')
                    else {
                        console.log(respu.pass)
                        if (respu == null) res.send('E2')
                        else res.send('A' + respu.pass)
                    }
                })
            }
        }
    })
})

router.post('/subir_apps', (req, res) => {
    var registros = (req.body.apps).split(';')
    var todos_elementos = new Array();
    for (var i = 0; i < registros.length; i++) {
        var reg = (registros[i].substring(0, registros.length - 1)).split(',')
        todos_elementos.push({
            nombre: reg[0],
            paquete: reg[1],
            version: reg[2],
            cod_version: reg[3]
        })
    }
    Apps.find().where({ usuario: req.body.usuario }).exec((error, resp) => {
        if (resp.length==0) {
            for(var i=0; i < todos_elementos.length; i++){
                nuevaApp= new Apps({
                    nombre: todos_elementos[i].nombre,
                    paquete: todos_elementos[i].paquete,
                    version : todos_elementos[i].version,
                    cod_version:todos_elementos[i].cod_version,
                    estado: true,
                    usuario: req.body.usuario
                })
                if(nuevaApp.paquete!=undefined || nuevaApp.nombre!=""){
                    nuevaApp.save((e, respuesta)=>{
                        console.log(respuesta.nombre+" ha sido ingresado")
                    })
                }
            }
        }
        res.send('OK')
    })
})

router.get('/datos', (req, res) => {
    Apps.find().exec((error, apps)=>{
        res.send(apps)
    })
})

router.get('/unde', (req,res)=>{
    Apps.find().where({paquete:undefined}).exec((req,resp)=>{
        res.send(resp)
    })
})


router.post('/apps_usuario', (req,res)=>{
    console.log('datos usuario: '+ req.body.usuario)
    Apps.find().where({usuario: req.body.usuario}).exec((error, resp)=>{
        res.send(resp)
    })
})

router.post('/bloquear_app', (req,res)=>{
    Apps.findOneAndUpdate({usuario:req.body.usuario, paquete:req.body.paquete},{estado:req.body.estado}, (req,resp)=>{
        console.log(resp)
        res.send('OK')
    })
})

router.post('/todas_bloqueadas', (req,res)=>{
    console.log('------Data bloq')
    Apps.find().where({estado:false, usuario: req.body.usuario}).exec((error, respuesta)=>{
        console.log(respuesta)
        res.send(respuesta)
    })
})

router.post('/eiminar_usuario', (req,res)=>{
    Hijos.findOneAndRemove({codigo: req.body.hijo},(e, resp)=>{
        res.send('OK')
    })
})

router.post('/recuperacion', (req,res)=>{
    User.findOne().where({mail: req.body.mail}).exec((error, resp)=>{
        if(resp==null){
            res.send('E1')
        }else{
            var p = {
                destino: req.body.mail,
                titulo: 'Recuperacion',
                nombre: req.body.mail,
                mensaje: 'Use el siguiente link para recuperar su cuenta',
                link_t: 'Recuperacion',
                link: `${url}/usuario/recuperar:${resp.identidad}-${resp.token}`,
            };
            //Envio el correo de activacion
            emailjs.send('gmail', 'template_JEaIsiId', p)
                .then(function (response) {
                    console.log('SUCCESS!', response.status, response.text);
                    res.send('OK')
                }, function (error) {
                    console.log('FAILED...', error);
                    res.send('E2')
                });
        }
    })
})

module.exports = router;

/*
Apps.findOne().where({paquete: element.paquete, usuario: req.body.usuario}).exec((e, resp)=>{
            if(resp== null){
                nuevaApp= new Apps({
                    nombre: element.nombre,
                    paquete: element.paquete,
                    version : element.version,
                    cod_version:element.cod_version,
                    estado: true,
                    usuario: req.body.usuario
                })
                nuevaApp.save((e, respuesta)=>{
                    console.log(element.nombre+" ha sido ingresado")
                })
            }
        })
*/