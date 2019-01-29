mongoose = require('mongoose');

//Se crea el esquema necesario_______________________________________________________________________________________________________________
var testSchema = mongoose.Schema({
    texto: String
});

//Exporta el esquema para poder ser usado en cada ruta que sea  necesario____________________________________________________________________
var test=module.exports=mongoose.model('test',testSchema);