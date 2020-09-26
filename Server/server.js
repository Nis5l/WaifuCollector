var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json())
var port = 80

app.get('/', function (req, res) {
   res.send('Hello World');
})

app.post('/', (req, res) =>
{
    console.log(req.body)
    res.send('OK')
})

var server = app.listen(port)
console.log("Started on port %s", port)