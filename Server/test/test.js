var request = require('request');
var io = require('console-read-write');
var tokenV = "";


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
                //console.log(body.cards[0].card);
                //console.log(response);
                token = body.token;
            }
        }
    );
}

function changePass(user, pass, newpass)
{
    request.post(
        'http://127.0.0.1:100/passchange',
        { json: { username: user, password: pass, newpassword: newpass} },
        (error, response, body) => 
        {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
}

function getfriends()
{
    request.post(
        'http://127.0.0.1:100/getfriends',
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
/*
async function main()
{
    console.log("GO");
    register("Test123", "Test1234");
    await io.read();
    login("Test123", "Test1234");
    await io.read();
    getfriends();
    await io.read();
    openPack();
}

main();
*/
var date;
function login(user, pass)
{
    console.log("presend: " + (Date.now() - date) + "ms");
    date = Date.now();
    request.post(
        'http://10.0.0.105:20001/login',
        { json: { username: user, password: pass } },
        (error, response, body) => 
        {
	    console.log("response: " +  (Date.now() - date) + "ms");
            if (!error && response.statusCode == 200) {
                console.log(body);
                tokenV = body.token;
            }
        }
    );
}
date = Date.now();
console.log("sending login");
login("Test123", "Test1234");
