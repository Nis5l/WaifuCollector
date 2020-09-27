const express = require('express');
const bodyParser = require('body-parser');
const database = require('./database');
const app = express();
const jwt = require('jsonWebToken');
require('datejs');
const Client = require('./cash');
const port = 100;
const jwtSecret = "yCSgVxmL9I";

const userLen = [4,20];
const userRegex = /^[a-zA-Z0-9_]+$/;
const passLen = [8, 30];
//const passRegex = /^[a-zA-Z0-9_]*}$/;

var packCooldown = 60;

var clients = {};

var cashTime = 10000;

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

app.post('/register', (req, res) =>
{
    var username = req.body.username;
    var password = req.body.password;

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
                registerCallback(false, "the password length must be between " + passLen[0] + " and " + passLen[1], res);
                return;
            }
    }
    console.log("Register " + username + " " + password);
    database.register(username, password, registerCallback, res);
});

app.post('/pack', (req, res) => 
{
    var tokenV = req.body.token;
    var decoded = jwt.verify(tokenV, jwtSecret);
    if(clients[decoded.id] == undefined)
    {
        createCash(decoded.id, run);
    }else
    {
        run(decoded.id);
    }
    function run(userID)
    {
        if(clients[decoded.id].packTime != null)
        {
            packCallBack(decoded.id, clients[decoded.id].packTime, res);
            return;
        }
        else
        {
            createCash(decoded.id);
            packCallBack(decoded.id, clients[decoded.id].packTime, res);
            return;
        }
    }
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

function loginCallback(b, messageV, usernameV, userIDV, res)
{
    var tokenV = "";
    if(b) tokenV = jwt.sign({username: usernameV, id: userIDV}, jwtSecret);
    res.send({status: b ? 0:1, token: tokenV, message: messageV});
    if(b)
    {
        createCash(userIDV, ()=>{});
    }
}

function registerCallback(b, message, res)
{
    //console.log(b ? "Worked":"Failed");
    res.send({status: b ? 0:1, message: message});
}

function packCallBack(userID, time, res)
{
    if(clients[userID] == undefined)
    {
        createCash(userID, run);
    }else
    {
        run(userID);
    }

    function run(userID)
    {
        let date = new Date().addSeconds(packCooldown);

        if(time == null)
        {
            console.log("NULL");
            //database.setPackTime(userID, date);
            console.log(clients[userID].packTime);
            clients[userID].packTime = date;
            console.log(clients[userID].packTime);
            res.send({packTime: "0", message:"OK", ids: [10,12,13]});
            return;
        }
        console.log(new Date() + "    " + new Date(time));
        if(new Date().isAfter(new Date(time)))
        {
            if(!decoded.id in clients)
            {
                createCash(userID);
                res.send({packTime: "time", message:"ERROR", ids: []});
                return;
            }
        
            clients[userID].packTime = date;
            res.send({packTime: "0", message:"OK", ids: [10,12,13]});
            return;
        }else
        {
            res.send({packTime: "time", message:"WAIT", ids: [10,12,13]});
            return;
        }
    }   
}

function createCash(userIDV, callback)
{
    console.log("checking cash of " + userIDV);
    if(!clients[userIDV])
    {
        console.log("creating cash for " + userIDV);
        clients[userIDV] = new Client(userIDV, callback);
        clients[userIDV].startDecay(cashTime, clearCash);
    }
}

function clearCash(userID)
{
    console.log("cleared " + userID);
    clients[userID].save();
    delete clients[userID];
}

console.log("Initializing DataBase")
database.init();
var server = app.listen(port)
console.log("Started on port %s", port)