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
    console.log("Login " + username + " " + password);
    if(/^[a-zA-Z0-9_]*}$/.test(username)) 
    {
        loginCallback(false, "the user can only contain letters, numbers and _", username, res);
        return;
    }
    database.login(username, password, username, res, loginCallback);
});

function loginCallback(b, messageV, usernameV, res)
{
    var tokenV = "";
    if(b) tokenV = jwt.sign({username: usernameV}, jwtSecret);
    res.send({status: b ? 0:1, token: tokenV, message: messageV});
}

app.post('/register', (req, res) =>
{
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    if(password != password2)
    {
        registerCallback(false, "error: passwords dont match", res);
        return;
    }
    console.log("Register " + username + " " + password + " " + password2);
    database.register(username, password, registerCallback, res);
})

function registerCallback(b, message, res)
{
    console.log(b ? "Worked":"Failed");
    res.send({status: b ? 0:1, message: message});
}

console.log("Initializing DataBase")
database.init();
var server = app.listen(port)
console.log("Started on port %s", port)