var express = require('express');
var bodyParser = require('body-parser');
var database = require('./database');
var app = express();
app.use(bodyParser.json())
var port = 80

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
    var key = "-1";
    if(log)
    {
        //generate key
    }
    res.send(key);
})

var server = app.listen(port)
console.log("Started on port %s", port)