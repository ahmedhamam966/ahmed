const express=require('express');
require('./src/db/mongoose');
//const cors = require('cors');
const mongoose=require('./src/db/mongoose')

const jwt=require('jsonwebtoken')
const app=express();
//app.use(cors())
const bodyparser=require('body-parser');
const list=require('./src/db/models/list.model');
const task=require('./src/db/models/task.model');
const User=require('./src/db/models/user.model');
app.use(bodyparser.json());




app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});


// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id= user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}
















let newTask = new task();

app.get('/lists',(req,res)=>{
    list.find({
      //  _userid:req.user_id
    
    })
    .then((lists)=>{res.send(lists)
    }).catch((e)=>{
    
      res.send(e);
    });
})
app.post('/lists',(req,res)=>{
    let title=req.body.title;
    let newlist=new list({
        title,
  //   _userid:req.user_id
    });
    newlist.save().then((listDoc)=>{
        res.send(listDoc);
    })
  
  }
  );
  app.patch('/lists/:id',authenticate,(req,res)=>{
    list.findByIdAndUpdate({_id:req.params.id,_userid:req.user_id},{
        $set:req.body}).then(()=>{
            res.sendStatus(200)
        }
            );
}
);
app.delete('/lists/:id',authenticate,(req,res)=>{
    list.findOneAndDelete({_id:req.params.id,_userid:req.user_id}).then((removelistDoc)=>{
        res.send(removelistDoc);
        deleteTasksFromList(removelistDoc._id)

  })
}
);
app.get('/lists/:listid/tasks',authenticate,(req,res)=>{
    task.find({listid:req.params.listid,_userid:req.user_id}).then((tasks)=>{
        res.send(tasks)
    }
 
 )});
 app.post('/lists/:listid/tasks',authenticate,(req,res)=>{
     list.findOne({_id:req.params.listid,_userid:req.user_id})
     .then((list)=>{
         if(list)
         {
           return true;
         }
         return false;
     })
     .then((cancreatetask)=>{
         if(cancreatetask){
            let newTask = new task({
                title:req.body.title,
            listid:req.params.listid
          
            });
            newTask.save().then((newtaskDoc)=>{
                res.send(newtaskDoc)
            })
         }
         else{
             res.sendStatus(404);
         }
     })
   

});
    app.patch('/lists/:listid/tasks/:taskid',authenticate,(req,res)=>{
        list.findOne({
            _id:req.params.listid,
            _userid:req.user_id
        
        }).then((list)=>{
            if(list)
            {
              return true;
            }
            return false;
        })
        .then((canupdatetasks)=>{
            if(canupdatetasks)
            {
                task.findByIdAndUpdate({_id:req.params.taskid,
                    listid:req.params.listid},{
                        $set:req.body})
                        .then(()=>{
                            res.send({message:'completed sussesfuly'})
                        }
                            );
                }else{
                    res.sendStatus(404)
                }
            });
                
            })
    
       
    app.delete('/lists/:listid/tasks/:taskid',authenticate,(req,res)=>{
   
        list.findOne({_id:req.params.listid,_userid:req.user_id})
        .then((list)=>{
            if(list)
            {
              return true;
            }
            return false;
        })
        .then((candeletetask)=>{
            if(candeletetask){
                task.findOneAndDelete({_id:req.params.id,_listid:req.params.listid}).then((removetaskDoc)=>{
                    res.send(removetaskDoc);
            
                })
            }else
            {
                res.sendStatus(404)
            }
      
        });

    });


    app.post('/users',(req,res)=>{
        let body=req.body;
        let newUser=new User(body);
        newUser.save().then(()=>{
            return newUser.createSession();
        }).then((refreshToken)=>{
            return newUser.generateAccessAuthToken( ).then((accessToken)=>{
                return {accessToken,refreshToken}
            });
        }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})



app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})


app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})



/* HELPER METHODS */
let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from " + _listId + " were deleted!");
    })
}

app.listen( 3000 ,() => {console.log('server is listen on port 3000');}
);
