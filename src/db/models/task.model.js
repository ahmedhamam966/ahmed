const mongoose = require('mongoose')
const TaskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    },
    listid:{
        type:mongoose.Types.ObjectId,
        required:true,
        
    },
    completed:{
        type:Boolean,
        default:false
    }
})
const task=mongoose.model('Task',TaskSchema);
module.exports=task