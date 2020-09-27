const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

require("./LessManager.js");

const app = express();

app.set('view engine', 'ejs');
app.use("/resources", express.static("resources"));
app.use("/assets", express.static("assets"));

const port = 8000;

const{

    API_HOST = 'localhost',
    API_PORT = '100',

    SESS_NAME = 'sid',
    SESS_SECRET = 'jgashjdftzuasgHJFASDHgkjas',
    SESS_LIFETIME = 1000 * 60 * 60

} = process.env;

app.use(session({

    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: 'production'
    }
}));

const redirectLogin = (req, res, next) => {

    if(!req.session.userId){

        res.redirect('/login');

    }else{

        next();

    }

}

const redirectDashboard = (req, res, next) => {

    if(req.session.userId){

        res.redirect('/dashboard');

    }else{

        next();

    }

}

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", function(req, res){

    res.render("home");

});

app.get("/login", redirectDashboard,  function(req, res){

    res.render("login");

});

app.post("/login", redirectDashboard, function(req, res){

    const { username, password } = req.body;

    console.log(username);
    console.log(password);

});

app.get("/register", redirectDashboard, function(req, res){

    res.render("register");

});

/*

    ERROR CODES:
        2 : username or password are null, empty or unidentified

*/

app.post("/register", redirectDashboard, function(req, res){

    const { username, password } = req.body;
    
    if(username && password){

        request.post(
            'http://' + API_HOST + ":" + API_PORT + "/register",
            { json: { username: username, password: password} },
            (error, response, body) => 
            {

                if (!error && response.statusCode == 200) {

                    console.log(body);

                    if(body.status == 0){

                        res.redirect("/login");

                    }else{

                        res.redirect("/register?errorCode=" + body.status + "&errorMessage=" + body.message);

                    }

                }else{

                    res.redirect("/register?errorCode=3&errorMessage=Wrong response");

                }
            }
        );

    }else{

        res.redirect("/register?errorCode=2&errorMessage=Username or password are empty");

    }

    console.log(username);

});

app.get("/dashboard", redirectLogin, function(req, res){

    res.render('home');

});

app.listen(port, function(){

    console.log("Server started at port %s", port);

});