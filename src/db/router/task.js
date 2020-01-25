/*const express = require('express')
const router = express.Router()
const list=require('../models/list.model');
app.get('/lists',(req,res)=>{list.find({}).then((lists)=>{res.send(lists)})});
.post('/lists',(req,res)=>{
    let title=req.body.title;
    let newlist=new list({
        title
  
    });
    newlist.save().then((listDoc)=>{
        res.send(listDoc);
    })
  
  }
  );
  app.patch('/lists/:id',(req,res)=>{
    list.findByIdAndUpdate({_id:req.params._id},{
        $set:req.body}).then(()=>{
            res.sendStatus(200)
        }
            );
}
);
app.delete('/lists/:id',(req,res)=>{
    list.findOneAndDelete({_id:req.params.id}).then((removelistDoc)=>{
        res.send(removelistDoc);

  })
}
);
app.get('/lists/:listid/tasks',(req,res)=>{
    task.find({_listid:req.params.listid}).then((tasks)=>{
        res.send(tasks)
    }
 
 )});
 app.post('/lists/:listid/tasks',(req,res)=>{
     
    let newTask=new task({
        title:req.body.title,
    _listid:req.params.listid
  
    })});
    app.patch('/lists/:listid/tasks/:listid',(req,res)=>{
        list.findByIdAndUpdate({_id:req.params.taskid,
        _listid:req.params.listid},{
            $set:req.body}).then(()=>{
                res.sendStatus(200)
            }
                );
    }
    );
    newTask.save().then((newTaskDoc)=>{
        res.send(newTaskDoc);
    });
    app.delete('/lists/:listid/tasks/:taskid',(req,res)=>{
        task.findOneAndDelete({_id:req.params.id,_listid:req.params.listid}).then((removetaskDoc)=>{
            res.send(removetaskDoc);
    
        })
    }
    );
*/