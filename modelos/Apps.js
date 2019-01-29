//Es necesario siempre hacer referencia al API de mongodb
mongoose = require('mongoose');

//Se crea el esquema necesario_______________________________________________________________________________________________________________
var appsSchema = mongoose.Schema({
    nombre: String,
    paquete : String,
    version: String,
    cod_version:String,
    estado: Boolean,
    usuario:String
});

//Exporta el esquema para poder ser usado en cada ruta que sea  necesario____________________________________________________________________
var apps=module.exports=mongoose.model('apps',appsSchema);