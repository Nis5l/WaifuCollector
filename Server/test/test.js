var request = require('request');
var io = require('console-read-write');
var tokenV = "";

function login(user, pass)
{
    request.post(
        'http://127.0.0.1:100/login',
        { json: { username: user, password: pass } },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {
                console.log(body);
                tokenV = body.token;
            }
        }
    );
}

function register(user, pass)
{
    request.post(
        'http://127.0.0.1:100/register',
        { json: { username: user, password: pass} },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
}

function openPack()
{
    request.post(
        'http://127.0.0.1:100/pack',
        { json: { token: tokenV} },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {
                console.log(body);
                token = body.token;
            }
        }
    );
}

function changePass(user, pass, newpass)
{
    request.post(
        'http://127.0.0.1:100/passchange',
        { json: { username: user, password: pass, passwordnew: newpass} },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
}

async function main()
{
    console.log("GO");
    register("SmallCode3", "Test123");
    await io.read();
    login("SmallCode3", "Test123");
    await io.read();
    changePass("SmallCode3", "Test123", "Test1234");
    await io.read();
    openPack();
}

main();