const express = require('express');

const app = express();

const port = 8000;

app.get("/", function(req, res){

    res.send("Hello!");

});

var server = app.listen(port, function(){

    console.log("Server started at port %s", port);

});