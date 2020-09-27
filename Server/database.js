const sql = require('mysql')
const bcrypt = require('bcrypt');
const packTime = "PACKTIME";

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
        con.query("SELECT * FROM user WHERE UPPER(username) = \"" + username.toUpperCase() +  "\"", function (err, result, fields) {
            if(result.length == 0)
            {
                callback(1, "login failed", username, -1, res);
                return;
            }
            bcrypt.compare(password, result[0].password, function(err, resp) {
                callback(resp, resp ? "logged in":"login failed", username, result[0].id, res);
            });
        });
    },

    register: function register(username , password, callback, res)
    {
        userexists(username, (b) => 
        {
            if(!b)
            {
                bcrypt.hash(password,  10, (err, hash) => {
                    con.query("INSERT INTO user (username, password, rank) VALUES ('" + username + "', '" + hash + "', 0)",
                    function (err, result, fields)
                    {
                        callback(true, "registered", res);
                    });
                });
            }
            else
            {
                callback(false, "error: user already exists",  res);
            }
        });
    },

        
    getPackTime: function getPackTime(userID, res, callback)
    {
        con.query("SELECT * FROM data WHERE `userID` = " + userID + " AND `key` = \"" + packTime +"\"", function (err, result, fields) {
            console.log(result);
            if(result == undefined || result.length == 0)
            {
                callback(userID, null, res);
                return;
            }
            callback(userID, result[0].value, res);
        });
    },

    getPackTime: function getPackTime(userID, callback)
    {
        con.query("SELECT * FROM data WHERE `userID` = " + userID + " AND `key` = \"" + packTime +"\"", function (err, result, fields) {
            console.log(result);
            if(result == undefined || result.length == 0)
            {
                callback(null);
                return;
            }
            callback(result[0].value);
        });
    },

    setPackTime: function setPackTime(userID, time)
    {
        //if exists just write value
        con.query("UPDATE `data` SET `value` = '" + time + "' WHERE `data`.`userID` = " + userID + " AND `data`.`key` = \"" + packTime +"\"", function (err, result, fields) {
            if(err)
            {
                con.query("INSERT INTO `data`(`userID`, `key`, `value`) VALUES (" + userID + ", '" + packTime + "', '" + time + "')", function (err, result, fields) {
                });
            }
        });
    },
}

function userexists(username, callback)
{
    con.query("SELECT * FROM user WHERE UPPER(username) = \"" + username.toUpperCase() + "\"", function (err, result, fields) {
        callback(result.length > 0);
    });
}


