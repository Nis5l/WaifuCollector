var request = require('request');
var io = require('console-read-write');
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

async function main()
{
    console.log("GO");
    register("Nissl" , "123456789", "123456789");
    await io.read()
    register("nissl" , "123456789", "123456789");
    // await io.read()
    // register("TestUser" , "123asdasasdas", "123asdasasdas");
    // await io.read()
    // register("Nissl" , "123", "1234");
    // await io.read();
    // register("Nis" , "123", "123");
    // await io.read();
    // register("Niasds<§" , "123", "123");
    // await io.read();
    // register("Nisasdasdasdasdasdasdasdasdasdasd" , "123", "123");
    // await io.read();
    // login("Nissl", "123456789");
    // await io.read();
    login("nissl", "123456789");
    await io.read();
    login("Nissl", "123456789");
}

main();