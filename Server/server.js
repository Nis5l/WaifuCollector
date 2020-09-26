var express = require('express');
const { response } = require('express');
var app = express();
var port = 80

app.get('/', function (req, res) {
   res.send('Hello World');
})

app.post('/', (request, response) =>
{
    console.log(request.body)
})

var server = app.listen(port)
console.log("Started on port %s", port)