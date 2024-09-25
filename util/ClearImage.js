const fs = require('fs');


const clearImage = async(filepath)=>{
try{
    await fs.promises.unlink(filepath);
}
catch(err){
    err.statusCode = 500;
    throw err;
}
}

module.exports = clearImage