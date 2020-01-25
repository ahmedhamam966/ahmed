const mongoose = require('mongoose')

mongoose.Promise=global.Promise;

mongoose.connect('mongodb://127.0.0.1:27017/myApi',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
})



module.exports=mongoose;
