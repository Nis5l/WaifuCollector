var request = require('request');
var token = "";

function login(user, pass)
{
    request.post(
        'http://127.0.0.1/login',
        { json: { username: user, password: pass } },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {
                console.log(body);
                console.log(body.token);
            }
        }
    );
}

function register(user, pass, pass2)
{
    request.post(
        'http://127.0.0.1/register',
        { json: { username: user, password: pass, password2: pass2 } },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {
                console.log(body);
                token = body.token;
            }
        }
    );
}
register("Nissl" , "123", "123")
login("Nissl", "123");