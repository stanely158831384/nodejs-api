const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const userSchema = require('./post-schema.js');

module.exports = function(mongoDBConnectionString){
    let User;

    return {
        connect: function(){
            return new Promise(
                function(resolve,reject){
                    let db = mongoose.createConnection(mongoDBConnectionString,{ useNewUrlParser: true, useUnifiedTopology: true });

                    db.on('error',(err)=>{
                        console.log("pass error connect()");
                        reject(err);
                    });

                    db.once('open',()=>{
                        User = db.model("User",userSchema);
                        resolve();
                    })
                }
            )
        },

        register: function(data){
            return new Promise((resolve,reject)=>{
                let newUser = new User(data);

                newUser.save((err)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(`new post: ${newUser._id} successfully added`);
                    }
                })
            })
        },

        login: function(_email,_password){
            return new Promise((resolve,reject)=>{
                User.findOne({email:_email}).exec().then(user=>{
                    if(_password==user.password){
                        resolve(user)
                    }else{
                        resolve("login fail, wrong password");
                    }
                }).catch(err=>{
                    reject("login fail"+err);
                })
            })
        },

        setProfile: function(data,id){
            return new Promise((resolve,reject)=>{
                User.updateOne({_id:id},{$set:data}).exec().then(()=>{
                    resolve(`user profile ${id} successfully updated`);
                }).catch((err)=>{
                    reject(err);
                })
            });
        },

        showAllAccounts: function(page, perPage){
            return new Promise((resolve,reject)=>{
                if(+page && +perPage){
                    let filter = {};
                    page = (+page)-1;
                User.find().sort().skip(page * +perPage).limit(+perPage).exec().then(user=>{
                    console.log("this is "+user);
                    resolve(user);
                }).catch((err)=>{
                    reject(err);
                });

            }else{
                reject("lack of page and perPage information");
            }
            })
        },

        devTool_checkUserData: function(id){
            return new Promise((resolve,reject)=>{
                User.findOne({_id:id}).exec().then((data)=>{
                    resolve(data);
                }).catch((err)=>{
                    reject("devTool_checkUserData fails to be used");
                })
            });
        }



    }

}