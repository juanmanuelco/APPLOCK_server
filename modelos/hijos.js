//Es necesario siempre hacer referencia al API de mongodb
mongoose = require('mongoose');

//Se crea el esquema necesario_______________________________________________________________________________________________________________
var hijosSchema = mongoose.Schema({
    codigo: String,
    padre:String,
    estado: String
});

//Exporta el esquema para poder ser usado en cada ruta que sea  necesario____________________________________________________________________
var hijos=module.exports=mongoose.model('hijos',hijosSchema);