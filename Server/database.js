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

    login: function login(username , password, callback)
    {
        con.query("SELECT * FROM user", function (err, result, fields) {
            //callback()
        });
    },

    register: function register(username , password, callback, res)
    {
        userexists(username, (b) => 
        {
            if(!b)
            {
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
<<<<<<< HEAD
    con.query("SELECT * FROM user WHERE Username = \"" + username + "\"", function (err, result, fields) {
        callback(result.length > 0);
=======
    //escape
    con.query("SELECT * FROM user WHERE username = \"" + username + "\"", function (err, result, fields) {
        console.log("len: " + result.length);
        console.log(result.length > 0);
        return result.length > 0;
>>>>>>> 36fcdae199d01ba94d7be123f2b0621aa8a0646c
    });
}