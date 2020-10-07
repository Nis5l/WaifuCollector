const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { cookie } = require('request');
require("./CSSManager.js");

const app = express();

app.set('view engine', 'ejs');
app.use("/resources", express.static("resources"));
app.use("/assets", express.static("assets"));

const port = 8000;

var token;

const{

    API_HOST = 'localhost',
    API_PORT = '100',

    SESS_NAME = 'sid',
    SESS_SECRET = 'jgashjdftzuasgHJFASDHgkjas',
    SESS_LIFETIME = 1000 * 60 * 60

} = process.env;

var sess = {

    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: false
    }

};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}

app.use(session(sess));

const redirectLogin = (req, res, next) => {

    if(!req.session.userID){

        res.redirect('/login');

    }else{

        next();

    }

}

const redirectDashboard = (req, res, next) => {

    if(req.session.userID){

        res.redirect('/dashboard');

    }else{

        next();

    }

}

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", function(req, res){

    res.render("home", { userID: req.session.userID });

});

app.get("/logout", redirectLogin, function(req, res){

    req.session.destroy();
    res.redirect("/login");

});

app.get("/login", redirectDashboard,  function(req, res){

    res.render("login", { userID: req.session.userID });

});

app.post("/login", redirectDashboard, function(req, res){
    const { username, password } = req.body;
    
    if(username && password){

        request.post(
            'http://' + API_HOST + ":" + API_PORT + "/login",
            { json: { username: username, password: password} },
            (error, response, body) => 
            {

                if (!error && response.statusCode == 200) {

                    if(body.status == 0){

                        token = body.token;

                        userID = body.userID;

                        req.session.userID = userID;
                        req.session.token = token;

                        req.session.save((err) => {

                            if(err)
                                console.log(err);

                        });

                        res.redirect("/dashboard");

                    }else
                    {
                        res.redirect("/login?errorCode=" + body.status + "&errorMessage=" + body.message);
                    }

                }else{

                    res.redirect("/login?errorCode=3&errorMessage=Wrong response");

                }
            }
        );

    }else{

        res.redirect("/login?errorCode=2&errorMessage=Username or password are empty");

    }

});

app.post("/passchange", function(req, res){

    const { password, password2 } = req.body;
    console.log(password + " " + password2);
    if(password && password2 && password == password2 && token){

        request.post(
            'http://' + API_HOST + ":" + API_PORT + "/passchange",
            { json: { token: token, newpassword: password} },
            (error, response, body) => 
            {
                if (!error && response.statusCode == 200) {

                    if(body.status == 0){
                        res.redirect("/dashboard");
                        //alert("Password Changed");
                    }
                }
            }
        );

    }else{

        res.redirect("/settings?errorCode=2&errorMessage=password empty or dont match");

    }

});

app.get("/register", redirectDashboard, function(req, res){

    res.render("register", { userID: req.session.userID });

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

});

app.get("/dashboard", redirectLogin, function(req, res){

    request.post(
        'http://' + API_HOST + ":" + API_PORT + "/getName",
        { json: { token: token} },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {

                if(body.status == 0){
                    var username = body.name;
                    //res.render('dashboard', { userID: req.session.userID, username: })
                }else{
                    var username = body.message;
                    //res.render('dashboard', { userID: req.session.userID, username: body.status.message})
                }

            }else{

                res.redirect("/login?errorCode=3&errorMessage=Wrong response");

            }

            request.post(
                'http://' + API_HOST + ":" + API_PORT + "/getPackTime",
                { json: { token: token} },
                (error, response, body) => 
                {
                    if (!error && response.statusCode == 200) {
        
                        if(body.status == 0){
                            res.render('dashboard', { userID: req.session.userID, time: 0, username: username, fulltime: body.fullTime})
        
                        }else if(body.status == 1)
                        {
                            res.render('dashboard', { userID: req.session.userID, time: body.packTime, username: username, fulltime: body.fullTime})
                        }
                        else{
                            res.redirect("/login?errorCode=" + body.status + "&errorMessage=" + body.message);
                        }
        
                    }else{
        
                        res.redirect("/login?errorCode=3&errorMessage=Wrong response");
        
                    }
                }
            );

        }
    );

});

app.get("/settings", redirectLogin, function(req, res){

    res.render("settings");

});

app.get("/pack", redirectLogin, function(req, res)
{
    request.post(
        'http://' + API_HOST + ":" + API_PORT + "/pack",
        { json: { token: token} },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {

                
                if(body.packTime == '0'){
                    
                    for(var i = 0; i < body.cards.length; i++)
                    {
                        body.cards[i].card.cardImage = "http://" + API_HOST + ":" + API_PORT + "/" + body.cards[i].card.cardImage;
                        body.cards[i].frame_front = "http://" + API_HOST + ":" + API_PORT + "/" + body.cards[i].frame_front;
                        body.cards[i].frame_back = "http://" + API_HOST + ":" + API_PORT + "/" + body.cards[i].frame_back;
                    }
                    res.render('pack', {cards: body.cards});

                }else{

                    res.redirect("/dashboard?errorCode=" + body.message);
                }

            }else{
                res.redirect("/login?errorCode=3&errorMessage=Wrong response");
            }
        }
    );

});

app.listen(port, function(){

    console.log("Server started at port %s", port);

});