var request = require('request');

function login(user, pass)
{
    request.post(
        'http://127.0.0.1/',
        { json: { username: user, password: pass } },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
}

login("Nissl", "123");