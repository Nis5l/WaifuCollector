var express = require('express');
const { response } = require('express');
var app = express();
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