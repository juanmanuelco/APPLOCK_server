//Es necesario siempre hacer referencia al API de mongodb
mongoose = require('mongoose');

//Se crea el esquema necesario_______________________________________________________________________________________________________________
var usuariosSchema = mongoose.Schema({
    identidad: String,
    mail: String,
    pass: Number,
    estado: Boolean,
    token: String
});

//Exporta el esquema para poder ser usado en cada ruta que sea  necesario____________________________________________________________________
var usuarios=module.exports=mongoose.model('usuarios',usuariosSchema);