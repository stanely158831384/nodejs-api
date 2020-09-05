const monogoDBConnectionString = "mongodb+srv://junjieZhang:034285719@cluster0.o2clf.mongodb.net/prj666New?retryWrites=true&w=majority";
const HTTP_PORT = process.env.PORT || 8080;

const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");

const dataService = require("./modules/data-services");

const data = dataService(monogoDBConnectionString);
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/api/posts",(req,res)=>{
    data.register(req.body).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    });
});

app.get("/api/posts",(req,res)=>{
    data.showAllAccounts(req.query.page,req.query.perPage).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    });
})

//login api
app.get("/api/login",(req,res)=>{
    data.login(req.query.email,req.query.password).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json(err);
    })
})

app.put("/api/posts/:id",(req,res)=>{
    data.setProfile(req.body,req.params.id).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message: `an error occurred: ${err}`});
    });
})

app.get("/api/posts/:id",(req,res)=>{
    data.devTool_checkUserData(req.params.id).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json(err);
    });
})


data.connect().then(()=>{
    app.listen(HTTP_PORT, ()=>{console.log("API listening on: " + HTTP_PORT)});
})
.catch((err)=>{
    console.log("unable to start the server: " + err);
    process.exit();
});



