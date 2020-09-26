var request = require('request');

function login(user, pass)
{
    request.post(
        'http://127.0.0.1/',
        { json: { username: user, password: pass } },
    );
}

login("Nissl", "123");