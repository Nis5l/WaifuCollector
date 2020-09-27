const express = require('express');

const app = express();

app.set('view engine', 'ejs');

const port = 8000;

app.get("/", function(req, res){

    res.render("home");

});

var server = app.listen(port, function(){

    console.log("Server started at port %s", port);

});