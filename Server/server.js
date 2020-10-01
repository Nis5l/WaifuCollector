const express = require('express');
const bodyParser = require('body-parser');
const database = require('./database');
const app = express();
const jwt = require('jsonWebToken');
require('datejs');
const Client = require('./cache');
const jwtSecret = "yCSgVxmL9I";
const moment = require('moment')
const utils = require('./utils');

app.use(express.static('Data'))
const imageBase = "Card/";

const port = 100;

const userLen = [4,20];
const userRegex = /^[a-zA-Z0-9_]+$/;
const passLen = [8, 30];
const packSize = 1;
//const passRegex = /^[a-zA-Z0-9_]*}$/;

var clients = {};

var cacheTime = 10000;
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
    database.login(username, password, (b, messageV, userIDV) => {
        var tokenV = "";
        if(b) tokenV = jwt.sign({username: username, id: userIDV}, jwtSecret);

        if(b)
            res.send({status: b ? 0:1, token: tokenV, userID: userIDV, message: messageV});
        else
        res.send({status: b ? 0:1, token: tokenV, message: messageV});

        if(b)
        {
            createCache(userIDV, username, ()=>{});
        }
    });
});

app.post('/register', (req, res) =>
{
    var username = req.body.username;
    var password = req.body.password;

    switch(checkUser(username))
    {
        case 1:
            {
                registerCallback(false, "the username length must be between " + userLen[0] + " and " + userLen[1]);
                return;
            }
        case 2:
            {
                registerCallback(false, "the user can only contain letters, numbers and _");
                return;
            }
    }

    switch(checkPass(password))
    {
        case 1:
            {
                registerCallback(false, "the password length must be between " + passLen[0] + " and " + passLen[1]);
                return;
            }
    }
    console.log("Register " + username + " " + password);
    database.register(username, password, registerCallback);

    function registerCallback(b, message)
    {
        //console.log(b ? "Worked":"Failed");
        res.send({status: b ? 0:1, message: message});
    }

});

app.get('/getname/:userID', (req, res) => {

    var userID = req.params.userID;

    database.getUserName(userID, (username) =>{

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
    try
    {
        var decoded = jwt.verify(tokenV, jwtSecret);
    }catch(JsonWebTokenError)
    {
        res.send({status : 1, message: "\"TF you doing here nigga, identify yourself, who tf are you\""});
        return;
    }
    if(clients[decoded.id] == undefined)
    {
        createCache(decoded.id, decoded.username, run);
    }else
    {
        run(decoded.id);
    }
    function run(userID)
    {
        if(clients[decoded.id].packTime != null)
        {
            packCallBack(decoded.id);
            return;
        }
        else
        {
            createCache(decoded.id, decoded.username, () => {
                packCallBack(decoded.id);
            }); 
            return;
        }

        function packCallBack(userID)
        {
            if(clients[userID] == undefined)
            {
                createCache(userID, decoded.username, run);
            }else
            {
                run(userID);
            }
        
            function run(userID)
            {
                var nowDate = moment();
                var date = moment(nowDate).add(packCooldown, 'seconds');
                var packDate = moment(parseInt(clients[userID].packTime));
        
                if(clients[userID] == null || clients[userID].packTime == "null" || nowDate.isAfter(packDate) || !packDate.isValid())
                {
                    clients[userID].packTime = date.valueOf();
                    var cards = [];
                    for(var i = 0; i < packSize; i++)
                    {
                        database.getRandomCard((card) => {
                            var quality = utils.getRandomInt(qualityrange[0], qualityrange[1]);
                            database.addCard(userID, card.id, quality);
                            card.cardImage = imageBase + card.cardImage;
                            database.getCardType(card.typeID, (result) => {
                                card.type = result;
                                cards.push({card: card, quality: quality});
                                if(i == packSize)
                                {
                                    res.send({packTime: "0", message:"OK", cards: cards});
                                }
                            });
                        });
                    }
                    return;
                }
        
                res.send({packTime: packDate.diff(nowDate).seconds(), message:"WAIT", cards: []});
                return;
        
            }   
        }    
    }
});

app.post('/passchange', (req, res) => {
    var tokenV = req.body.token;
    try
    {
        var decoded = jwt.verify(tokenV, jwtSecret);
    }catch(JsonWebTokenError)
    {
        res.send({status : 1, message: "\"TF you doing here nigga, identify yourself, who tf are you\""});
        return;
    }
    var username = decoded.username;
    var newpassword = req.body.newpassword;
    switch(checkPass(newpassword))
    {
        case 1:
            {
                res.send({status: 1, message: "the password length must be between " + passLen[0] + " and " + passLen[1]});
                return;
            }
    }
    database.userexists(username, (b) => {
        if(b)
        {
            database.changePass(username, newpassword);
            res.send({status: 0, message: "Password changed"});
        }else
        {
            res.send({status: 1, message: "Failed"});
        }
    });
});

app.post('/getfriends', (req, res) => {
    var tokenV = req.body.token;
    try
    {
        var decoded = jwt.verify(tokenV, jwtSecret);
    }catch(JsonWebTokenError)
    {
        res.send({status : 1, message: "\"TF you doing here nigga, identify yourself, who tf are you\""});
        return;
    }

    if(clients[decoded.id] == undefined)
    {
        createCache(decoded.id, decoded.username, run);
    }else
    {
        run(decoded.id);
    }

    function run(userID)
    {
        var friendIDs = clients[userID].getFriends();
        var friends = [];
        for(var i = 0; i < friendIDs.length; i++)
        {
            var id = friendIDs[i];
            if(clients[id] != undefined)
            {
                friends.push({userID: id, username: clients[id].username});

                if(i == friendIDs.length)
                {
                    res.send({status: 0, friends: friends});
                }

            }else
            {
                database.getUserName(id, (username) => {
                    if(username != null)
                    {
                        createCache(id, username, ()=>
                        {
                            friends.push({userID: id, username: clients[id].username});
                            if(i == friendIDs.length)
                            {
                                res.send({status: 0, friends: friends});
                            }
                        });
                    }
                });
            }
        }
        
    }
});

function checkUser(username)
{
    if(username == undefined || username.length < userLen[0] || username.length > userLen[1]) return 1;
    if(!userRegex.test(username)) return 2;
    return 0;
}

function checkPass(password)
{
    if(password == undefined || password.length < userLen[0] || password.length > userLen[1]) return 1;
    //if(!passRegex.test(password)) return 2;
    return 0;
}

function createCache(userIDV, username, callback)
{
    if(!clients[userIDV])
    {
        clients[userIDV] = new Client(userIDV, username, callback);
        clients[userIDV].startDecay(cacheTime, clearCache);
    }
}

function clearCache(userID)
{
    clients[userID].save();
    delete clients[userID];
}

console.log("Initializing DataBase");
database.init();
var server = app.listen(port);
console.log("Started on port %s", port);