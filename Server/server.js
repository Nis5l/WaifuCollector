const express = require('express');
const bodyParser = require('body-parser');
const database = require('./database');
const app = express();
const jwt = require('jsonWebToken');
const port = 80;
const jwtSecret = "yCSgVxmL9I";

const userLen = [4,20];
const userRegex = /^[a-zA-Z0-9_]+$/;
const passLen = [8, 30];
//const passRegex = /^[a-zA-Z0-9_]*}$/;

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
    database.login(username, password, username, res, loginCallback);
});

function checkUser(username)
{
    if(username.length < userLen[0] || username.length > userLen[1]) return 1;
    if(!userRegex.test(username)) return 2;
    return 0;
}

function checkPass(password)
{
    if(password.length < userLen[0] || password.length > userLen[1]) return 1;
    //if(!passRegex.test(password)) return 2;
    return 0;
}

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
    switch(checkUser(username))
    {
        case 1:
            {
                registerCallback(false, "the username length must be between " + userLen[0] + " and " + userLen[1], res);
                return;
            }
        case 2:
            {
                registerCallback(false, "the user can only contain letters, numbers and _", res);
                return;
            }
    }

    switch(checkPass(password))
    {
        case 1:
            {
                registerCallback(false, "the username length must be between " + passLen[0] + " and " + passLen[1], res);
                return;
            }
    }
    console.log("Register " + username + " " + password + " " + password2);
    database.register(username, password, registerCallback, res);
});

function registerCallback(b, message, res)
{
    //console.log(b ? "Worked":"Failed");
    res.send({status: b ? 0:1, message: message});
}

console.log("Initializing DataBase")
database.init();
var server = app.listen(port)
console.log("Started on port %s", port)