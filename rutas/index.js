express = require('express');
router = express.Router();

router.get('/', (req,res)=>{
    res.send('Este es el servidor')
})



module.exports = router;