var sql = require('mysql')

var con = sql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

module.exports = {

    init: function init()
    {
        con.connect(() =>
        {
            con.query("CREATE DATABASE IF NOT EXISTS WaifuCollector");
            con.query("USE WaifuCollector");
            con.query("CREATE TABLE IF NOT EXISTS user ( `id` INT NOT NULL AUTO_INCREMENT , `username` TEXT NOT NULL , `password` TEXT NOT NULL , `rank` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
            con.query("CREATE TABLE IF NOT EXISTS card ( `id` INT NOT NULL AUTO_INCREMENT , `cardName` TEXT NOT NULL , `typeID` INT NOT NULL , `cardDescription` LONGTEXT NOT NULL , `cardImage` TEXT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;");
            con.query("CREATE TABLE IF NOT EXISTS cardtype ( `id` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
            con.query("CREATE TABLE IF NOT EXISTS unlocked ( `id` INT NOT NULL AUTO_INCREMENT , `userID` INT NOT NULL , `cardID` INT NOT NULL , `quality` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
            con.query("CREATE TABLE IF NOT EXISTS data ( `id` INT NOT NULL AUTO_INCREMENT , `userID` INT NOT NULL , `key` TEXT NOT NULL , `value` LONGTEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
        });
    },

    login: function login(username , password, username, res, callback)
    {
        //SQL INJECTION
        con.query("SELECT * FROM user WHERE username = \"" + username +  "\" AND password = \"" + password + "\"", function (err, result, fields) {
            var b = result.length > 0;
            callback(b, b ? "logged in":"login failed", username, res);
        });
    },

    register: function register(username , password, callback, res)
    {
        userexists(username, (b) => 
        {
            if(!b)
            {
                //SQL INJECTION
                con.query("INSERT INTO user (username, password, rank) VALUES ('" + username + "', '" + password + "', 0)",
                function (err, result, fields)
                {
                    callback(true, "registered", res);
                });
            }
            else
            {
                callback(false, "error: user already exists",  res);
            }
        });
    }
}
//------------------------------------
//              TODO
//  get net weil di querys async san
//------------------------------------

function userexists(username, callback)
{
    con.query("SELECT * FROM user WHERE username = \"" + username + "\"", function (err, result, fields) {
        callback(result.length > 0);
    });
}