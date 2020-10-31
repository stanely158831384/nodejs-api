const monogoDBConnectionString = "mongodb+srv://junjieZhang:00000000@cluster0.o2clf.mongodb.net/prj666New?retryWrites=true&w=majority";
const HTTP_PORT = process.env.PORT || 8080;

const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");

const dataService = require("./modules/data-services");

const data = dataService(monogoDBConnectionString);
const app = express();

app.use(bodyParser.json());
app.use(cors());


//for picture uplaod and download functionality
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

// const storage = new GridFsStorage({
//     url: monogoDBConnectionString,
//     file: (req, file) => {
//       return new Promise((resolve, reject) => {
//         crypto.randomBytes(16, (err, buf) => {
//           if (err) {
//             return reject(err);
//           }
//           const filename = buf.toString("hex") + path.extname(file.originalname);
//           const fileInfo = {
//             filename: filename,
//             bucketName: "uploads"
//           };
//           resolve(fileInfo);
//         });
//       });
//     }
//   });


//here is for the automatic refreshness functionality.
var CronJob = require('cron').CronJob;
new CronJob('* * 0 * * *', function() {
    //this command will reset the "delivery" contribute at the user collection to 'n', at everyday midnight.
    data.globalDataChange('{"delivery":"n"}').then((data)=>{res.json(data)}).catch((err)=>{res.json(err)});
}, null, true);

const storage = new GridFsStorage({
    url: monogoDBConnectionString,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
          const filename = file.originalname.split('.').slice(0, -1).join('.') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "uploads"
          };
          resolve(fileInfo);
        });
    
    }
  });
  
  const upload = multer({
    storage
  });
//


//register api
//hints: when you post the data, the data must been in form of the schema at post-schema.js
app.post("/api/newposts",(req,res)=>{
    data.register(req.body).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    });
});

//show all account information
//hints:http://localhost:8080/api/posts?page=1&perPage=5
app.get("/api/posts",(req,res)=>{
    data.showAccountsByPage(req.query.page,req.query.perPage).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    });
})

//for all user data
//test api not for normal use
app.get("/api/allposts",(req,res)=>{
    data.showAllAccounts().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    });
})

//reset the delivery options
app.get("/api/globalChange",(req,res)=>{
    data.globalDataChange('{"delivery":"n"}').then((data)=>{res.json(data)}).catch((err)=>{res.json(err)});
})



//login api
//hints:http://localhost:8080/api/login?email=stanley@gmail.com&password=1
app.get("/api/login",(req,res)=>{
    data.login(req.query.email,req.query.password).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json(err);
    })
})

//update profile
//hints: this id must be the ObjectId
app.put("/api/posts/:id",(req,res)=>{
    data.setProfile(req.body,req.params.id).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    });
})

//get user information for test purpose
app.get("/api/posts/:id",(req,res)=>{
    data.devTool_checkUserData(req.params.id).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json(err);
    });
});

app.get("/api/show_N_delivery",(req,res)=>{
     data.showNotDeliveryClient().then((data)=>{
         res.json(data);
     }).catch((err)=>{
         res.json(err);
     })
});

app.get("/api/show_Y_delivery",(req,res)=>{
    data.showDeliveryClient().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json(err);
    })
});



//pictures api

//1.upload the picture
app.post("/upload", upload.single("file"), (req, res) => {
    console.log("req body",req.file.originalname);
    res.json(req.file);
  });
//2.download the picture with id
app.get("/image/:filename", (req, res) => {
    // console.log('id', req.paramss.id)
    data.downloadPicture(req.params.filename,res).then(()=>{}).catch((data)=>{res.json(data)});
});
//3.delete the picture with id
app.post("/file/del/:id",(req,res)=>{
    data.deletePicture(req.params.id).then((data)=>{res.json(data)}).catch((data)=>{res.json(data)});
})

//menu api

//input new menu
app.post("/api/newMenu",(req,res)=>{
    data.createAndUpdate(req.body)
    .then((result)=>{
        res.json(result);
    }).catch((result)=>{
        res.json(result);
    }
    );
})

//updates a current menu

app.post("/api/updateCurrentMenuByBody",(req,res)=>{
    data.updatesNewMenu(req.body).then(data=>{res.json(data)}).catch((err)=>{res.json("route: fail: "+err)});
})



//show all menus
app.get("/api/allMenus",(req,res)=>{
    data.showAllMenus().then((data)=>{res.json(data)}).catch(
        (data)=>{res.json(data)}
    );
});

//findone dev_tool

app.get("/api/findMenuByMenuCode/:menuCode",(req,res)=>{
    data.findOneMenuById(req.params.menuCode).then(data=>{res.json(data)}).catch((err)=>{res.json("route: fail: "+err)});
})

app.post("/api/findMenuByBody",(req,res)=>{
    data.findOneMenuByBody(req.body).then(data=>{res.json(data)}).catch((err)=>{res.json("route: fail: "+err)});
})

app.post("/api/menuDel/:menuCode",(req,res)=>{
    data.deleteMenu(req.params.menuCode).then((data)=>{res.json(data)}).catch((data)=>{res.json(data)});
})


data.connect().then(()=>{
    app.listen(HTTP_PORT, ()=>{console.log("API listening on: " + HTTP_PORT)});
})
.catch((err)=>{
    console.log("unable to start the server: " + err);
    process.exit();
});





