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

app.post('/', (req, res) =>
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

var server = app.listen(port)
console.log("Started on port %s", port)