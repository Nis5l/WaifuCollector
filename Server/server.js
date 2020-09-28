const express = require('express');
const bodyParser = require('body-parser');
const database = require('./database');
const app = express();
const jwt = require('jsonWebToken');
require('datejs');
const Client = require('./cash');
const jwtSecret = "yCSgVxmL9I";
const moment = require('moment')
const utils = require('./utils');

app.use(express.static('Data'))
const imageBase = "Card/";

const port = 100;

const userLen = [4,20];
const userRegex = /^[a-zA-Z0-9_]+$/;
const passLen = [8, 30];
//const passRegex = /^[a-zA-Z0-9_]*}$/;


var clients = {};

var cashTime = 10000;
var packCooldown = 10;
var qualityrange = [1,7];

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

app.get('/getname/:userID', (req, res) => {

    var userID = req.params.userID;

    console.log(userID);

    database.getUserName(userID, (username) =>{

        console.log(username);

        if(username == "null"){

            res.send({status: 1, message: "User with userID " + userID + " not found!"});
            return;

        }

        res.send({status: 0, name: username});

    });

    return;

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
            packCallBack(decoded.id, res);
            return;
        }
        else
        {
            createCash(decoded.id);
            packCallBack(decoded.id, res);
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

    if(b)
        res.send({status: b ? 0:1, token: tokenV, userID: userIDV, message: messageV});
    else
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

function packCallBack(userID, res)
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
        var nowDate = moment();
        var date = moment(nowDate).add(packCooldown, 'seconds');
        var packDate = moment(parseInt(clients[userID].packTime));

        //console.log(clients[userID].packTime);
        //console.log(nowDate);
        //console.log(packDate);
        //console.log(date);
        //console.log(date.isAfter(nowDate));
        
        if(clients[userID] == null || clients[userID].packTime == "null" || nowDate.isAfter(packDate) || !packDate.isValid())
        {
            clients[userID].packTime = date.valueOf();
            database.getRandomCard((card) => {
                var quality = utils.getRandomInt(qualityrange[0], qualityrange[1]);
                database.addCard(userID, card.id, quality);
                card.cardImage = imageBase + card.cardImage;
                res.send({packTime: "0", message:"OK", id: card, quality: quality});
            });
            return;
        }

        res.send({packTime: packDate.diff(nowDate).seconds(), message:"WAIT", ids: []});
        return;

    }   
}       

function createCash(userIDV, callback)
{
    if(!clients[userIDV])
    {
        clients[userIDV] = new Client(userIDV, callback);
        clients[userIDV].startDecay(cashTime, clearCash);
    }
}

function clearCash(userID)
{
    clients[userID].save();
    delete clients[userID];
}

console.log("Initializing DataBase")
database.init();
var server = app.listen(port)
console.log("Started on port %s", port)