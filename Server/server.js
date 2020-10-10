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
const frameBase = "Frame/"

const port = 100;

const userLen = [4,20];
const userRegex = /^[a-zA-Z0-9_]+$/;
const passLen = [8, 30];
const packSize = [1,3];
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

app.post('/getName', (req, res) => {

    var token = req.body.token;
    try
    {
        var decoded = jwt.verify(token, jwtSecret);
    }catch(JsonWebTokenError)
    {
        res.send({status : 1, message: "Identification Please"});
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
        username = clients[userID].username;

        if(!username || username == "null" || username == null){

            res.send({status: 1, message: "User with userID " + userID + " not found!"});
            return;

        }

        res.send({status: 0, name: username});
    }
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
        res.send({status : 1, message: "Identification Please"});
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
                    var iterations = utils.getRandomInt(packSize[0], packSize[1]);
                        database.getRandomCard(iterations, (cards) => {
                            for(var j = 0; j < cards.length; j++)
                            {
                                var quality = utils.getRandomInt(qualityrange[0], qualityrange[1]);
                                cards[j].cardImage = imageBase + cards[j].cardImage;
                            }
                            database.getRandomFrame(iterations, (frames) => {
                                for(var j = 0; j < frames.length; j++)
                                {
                                    frames[j].path_front = frameBase + frames[j].path_front;
                                    frames[j].path_back = frameBase + frames[j].path_back;
                                }

                                for(var j = frames.length - 1; j < iterations; j++)
                                {
                                    frames[j] = frames[utils.getRandomInt(0,frames.length-1)];
                                }
                                for(var j = 0; j < cards.length; j++)
                                {
                                    cards[j].frame = frames[j];
                                    database.addCard(userID, cards[j].id, quality, frames[j].id);
                                }
                                run2(0);
                                function run2(iteration)
                                {
                                    database.getCardType(cards[iteration].typeID, (result) => {
                                        cards[iteration].type = result;
                                        if(iteration == iterations - 1)
                                        {
                                            res.send({packTime: "0", message:"OK", cards: cards});
                                            return;
                                        }else
                                        {
                                            run2(iteration+1);
                                        }
                                    });
                                }
                            });

                        });
                    }else
                    {
                    res.send({packTime: packDate.diff(nowDate).seconds(), message:"WAIT", cards: []});
                    return;
                    }
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
        res.send({status : 1, message: "Identification Please"});
        return;
    }
    var username = decoded.username;
    var newpassword = req.body.newpassword;
    console.log("Passchange: " + username + " " + newpassword);
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

app.post('/getPackTime', (req, res) => {

    var token = req.body.token;
    try
    {
        var decoded = jwt.verify(token, jwtSecret);
    }catch(JsonWebTokenError)
    {
        res.send({status : 1, message: "Identification Please"});
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
        username = clients[userID].packTime;

        var nowDate = moment();
        var packDate = moment(parseInt(clients[userID].packTime));

        if(clients[userID] == null || clients[userID].packTime == "null" || nowDate.isAfter(packDate) || !packDate.isValid())
        {
            res.send({status: 0, packTime: 0, fullTime: packCooldown * 1000});
            return;
        }else
        {
            res.send({status: 1, packTime: packDate.diff(nowDate).seconds(), fullTime: packCooldown * 1000});
        }
    }
    return;

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