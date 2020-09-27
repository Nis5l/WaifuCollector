const express = require('express');
const bodyParser = require('body-parser');
const database = require('./database');
const app = express();
const jwt = require('jsonWebToken');
const port = 80;
const jwtSecret = "yCSgVxmL9I";

app.use(bodyParser.json());

app.get('/', function (req, res)
{
   res.send('Hello World');
})

app.post('/login', (req, res) =>
{
    var username = req.body.username;
    var password = req.body.password;
    var log = database.login(username, password);
    console.log("Login:%s;%s-%s", username, password, log);
    
    var toeknV = "";
    var statusV = 1;
    var messageV = "Denied";
    if(log)
    {
        toeknV = jwt.sign({username: username}, jwtSecret);
        statusV = 0;
        var messageV = "Welcome";
    }
    res.send({token: toeknV, status: statusV, message: messageV});
})

app.post('/register', (req, res) =>
{
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var log = database.register(username, password);
    console.log("Register:%s;%s-%s", username, password, log);
    
    var statusV = 1;
    var messageV = "Error";
    if(log)
    {
        toeknV = jwt.sign({username: username}, jwtSecret);
        statusV = 0;
        var messageV = "Registered";
    }
    res.send({status: statusV, message: messageV});
})

console.log("Initializing DataBase")
database.init();
var server = app.listen(port)
console.log("Started on port %s", port)