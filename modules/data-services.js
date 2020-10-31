const mongoose = require('mongoose');

//for picture upload functionality
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
//

mongoose.Promise = global.Promise;

const userSchema = require('./post-schema-user.js');
const menuSchema = require('./post-schema-menu.js');
const { promises } = require('fs');
const { resolve } = require('path');

module.exports = function (mongoDBConnectionString) {
    let User;
    //new
    let gfs;
    let Menu;
    //

    return {
        connect: function () {
            return new Promise(
                function (resolve, reject) {
                    let db = mongoose.createConnection(mongoDBConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

                    db.on('error', (err) => {
                        console.log("pass error connect()");
                        reject(err);
                    });

                    db.once('open', () => {
                        User = db.model("User", userSchema);
                        Menu = db.model("Menu", menuSchema);
                        //new 
                        gfs = new mongoose.mongo.GridFSBucket(db.db, {
                            bucketName: "uploads"
                        });
                        //
                        resolve();
                    })
                }
            )
        },

        register: function (data) {
            return new Promise((resolve, reject) => {
                let newUser = new User(data);
                console.log(newUser);
                newUser.save((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(`new post: ${newUser._id} successfully added`);
                    }
                })
            })
        },

        login: function (_email, _password) {
            return new Promise((resolve, reject) => {
                User.findOne({ email: _email }).exec().then(user => {
                    if (_password == user.password) {
                        resolve(user)
                    } else {
                        resolve("login fail, wrong password");
                    }
                }).catch(err => {
                    reject("login fail" + err);
                })
            })
        },

        setProfile: function (data, id) {
            return new Promise((resolve, reject) => {
                User.updateOne({ _id: id }, { $set: data }).exec().then(() => {
                    resolve(`user profile ${id} successfully updated`);
                }).catch((err) => {
                    reject(err);
                })
            });
        },

        showAccountsByPage: function (page, perPage) {
            return new Promise((resolve, reject) => {
                if (+page && +perPage) {
                    let filter = {};
                    page = (+page) - 1;
                    User.find().sort().skip(page * +perPage).limit(+perPage).exec().then(user => {
                        console.log("this is " + user);
                        resolve(user);
                    }).catch((err) => {
                        reject(err);
                    });

                } else {
                    reject("lack of page and perPage information");
                }
            })
        },

        showAllAccounts: function () {
            return new Promise((resolve, reject) => {
                User.find().sort().exec().then(user => {
                    resolve(user);
                }).catch((err) => {
                    reject(err);
                });
            })
        },
        //newJson is the value, that you want to adjust or add into your user collection, for example:'{"delivery":"n"}'
        //If '{"delivery":"n"}' is not existed, the system will create it for you.
        //Else it will change the "delivery"'s value for you globally.
        globalDataChange: function (newJson) {
            return new Promise((resolve, reject) => {
                this.showAllAccounts().then((data) => {
                    data.forEach(element => {
                        this.setProfile(JSON.parse(newJson), element._id).then((data) => { resolve("success at global show set:" + data) })
                            .catch((err) => { reject("failed at global show set: " + err) });
                        //console.log("this is the: "+element );

                    });
                }).catch((err) => { "failed at global show: " + err })
                resolve();
            })
        },

        showNotDeliveryClient: function () {
            return new Promise((resolve, reject) => {
                User.find({ delivery: "n" }).exec().then((data) => {
                    resolve(data);
                }).catch((err) => {
                    reject("showNotDeliveryClient fails to be used");
                })
            });
        },

        showDeliveryClient: function () {
            return new Promise((resolve, reject) => {
                User.find({ delivery: "y" }).exec().then((data) => {
                    resolve(data);
                }).catch((err) => {
                    reject("showDeliveryClient fails to be used");
                })
            });
        },

        devTool_checkUserData: function (id) {
            return new Promise((resolve, reject) => {
                User.findOne({ _id: id }).exec().then((data) => {
                    resolve(data);
                }).catch((err) => {
                    reject("devTool1_checkUserData fails to be used");
                })
            });
        },

        downloadPicture: function (fileName, res) {
            return new Promise((resolve, reject) => {
                gfs.find({
                    filename: fileName
                })
                    .toArray((err, files) => {
                        if (!files || files.length === 0) {
                            reject("no file exist")
                        }
                        gfs.openDownloadStreamByName(fileName).pipe(res);

                        resolve(files);
                    });
            });
        },

        deletePicture: function (id) {
            return new Promise((resolve, reject) => {
                gfs.delete(new mongoose.Types.ObjectId(id), (err, data) => {
                    if (err) {
                        reject("fail to delete" + err);
                    }
                    resolve("the file " + id + "has been deleted successfully");
                });

            });
        },

        //foodMenu api

        //1.display all menus
        showAllMenus: function () {
            return new Promise((resolve, reject) => {
                Menu.find().sort().exec().then((data) => { resolve(data) })
                    .catch((err) => { reject(err) });
            });
        },


        //menucode is the unique code for each menu.
        //this function will find the certain menu for us, if that menu contains the menudate.
        findOneMenuByBody:function(menudata){
            return new Promise((resolve,reject)=>{
                Menu.findOne({ menuCode: menudata.menuCode }).exec().then(data => {
                    if(data!=null){
                        resolve(data);
                    }else{
                        resolve("cannot find out");
                    }
                }).catch(err => {
                    reject("find out err: " + err);
                })
            });
        },

        findOneMenuById:function(id){
            return new Promise((resolve,reject)=>{
                Menu.findOne({ menuCode: id }).exec().then(data => {
                    if(data!=null){
                        resolve(data);
                    }else{
                        resolve("cannot find out");
                    }
                }).catch(err => {
                    reject("find out err: " + err);
                })
            });
        },

        //this function will save the menu
        uploadsNewMenu: function (menudata) {
            return new Promise((resolve, reject) => {
                this.showAllMenus().then((data)=>{
                    var count = Object.keys(data).length;
                    menudata.menuCode=count+1;
                    let newMenu = new Menu(menudata);
                    newMenu.save((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(`new post: ${newMenu._id} ${newMenu.menuCode}successfully added`);
                        }
                    })                    
                }).catch((err)=>{reject(err)})
            });
        },

        //this function will change the menu with the %set data.
        updatesNewMenu:function(menudata){
            return new Promise((resolve, reject) => {
            Menu.updateOne({  menuCode:menudata.menuCode }, { $set: menudata }).exec().then((data) => {
                resolve(`user profile ${menudata.menuCode} successfully updated`);
            }).catch((err) => {
                reject("update error 1 "+err);
            })
            })
        },

        //this function will create or update a existing menu, and it can prevent the menucode repeated.
        createAndUpdate:function(menudata){
            return new Promise((resolve, reject) => {
                this.findOneMenuByBody(menudata).then((data)=>{
                    if(data=="cannot find out"){
                        this.uploadsNewMenu(menudata).then((data)=>{resolve(data)}).catch((err)=>{reject(err)});
                    }else{
                        this.updatesNewMenu(menudata).then((data)=>{resolve(data)}).catch((err)=>{reject(err)});
                    }
                }).catch((err)=>{reject("err is at the createAndUpdate: "+err)});
            })
        },
        deleteMenu: function (menuCode) {
            return new Promise((resolve, reject) => {
                Menu.findOneAndRemove({ menuCode:menuCode })
                    .then(() => {
                        this.showAllMenus().then((data)=>{
                            var counter =1;
                            data.forEach(element => {
                                element.menuCode=counter;
                                console.log(element);
                                Menu.updateOne({_id:element._id},{$set:element}).exec().then(() => {
                                    resolve("user profile "+element.menuCode+"successfully updated");
                                }).catch((err) => {
                                    reject("update error 1 "+err);
                                })
                                counter=counter+1;
                            });
                        }).catch((err)=>{reject(err)});
                    }).catch((err) => {
                        reject(err);
                    });

                
            })
        }


    }

}