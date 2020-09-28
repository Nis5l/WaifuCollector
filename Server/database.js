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

    login: function login(username , password, callback)
    {
        //SQL INJECTION
        con.query("SELECT * FROM user WHERE UPPER(username) = \"" + username.toUpperCase() +  "\"", function (err, result, fields) {
            if(result.length == 0)
            {
                callback(0, "login failed", -1);
                return;

            }
            bcrypt.compare(password, result[0].password, function(err, resp) {
                callback(resp, resp ? "logged in":"login failed", result[0].id);
            });
        });
    },

    register: function register(username , password, callback)
    {
        userexists(username, (b) => 
        {
            if(!b)
            {
                bcrypt.hash(password,  10, (err, hash) => {
                    con.query("INSERT INTO user (username, password, rank) VALUES ('" + username + "', '" + hash + "', 0)",
                    function (err, result, fields)
                    {
                        callback(true, "registered");
                    });
                });
            }
            else
            {
                callback(false, "error: user already exists");
            }
        });
    },

        
    getPackTime: function getPackTime(userID, res, callback)
    {
        con.query("SELECT * FROM data WHERE `userID` = " + userID + " AND `key` = \"" + packTime +"\"", function (err, result, fields) {
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
        con.query("UPDATE `data` SET `value` = '" + time + "' WHERE `data`.`userID` = " + userID + " AND `data`.`key` = \"" + packTime +"\"", function (err, result, fields) {
            if(result.affectedRows == 0)
            {
                con.query("INSERT INTO `data`(`userID`, `key`, `value`) VALUES (" + userID + ", '" + packTime + "', '" + time + "')", function (err, result, fields) {
                });
            }else
            {
            }
        });
    },

    getRandomCard: function getRandomCard(callback)
    {
        con.query("SELECT * FROM `card` ORDER BY RAND() LIMIT 1", function (err, result, fields)
        {   
            callback(result[0]);
        });
    },

    getUserName: function getUserName(userID, callback){

        con.query("SELECT username FROM `user` WHERE id=" + userID, function(err, result, fields){

            if(err)
                console.log(err);

            if(result != undefined && result[0] != undefined && result[0].username != undefined){

                callback(result[0].username);   
                return;

            }

            callback("null");

        });

    },

    addCard: function addCard(userID, cardID, quality)
    {
        con.query("INSERT INTO `unlocked` (`id`, `userID`, `cardID`, `quality`) VALUES (NULL, " + userID + ", " + cardID + ", " + quality + ");", function (err, result, fields)
        {
        });
    },

    changePass: function changePass(username, newPass)
    {
        bcrypt.hash(newPass,  10, (err, hash) => {
            con.query("UPDATE `user` SET `password` = '" + hash + "' WHERE `user`.`username` = \"" + username + "\"", function (err, result, fields) {
            });
        });
    },

    getCardType: function getCardType(typeID, callback)
    {
        con.query("SELECT * FROM `cardtype` WHERE id=" + typeID, function(err, result, fields){

            if(result != undefined && result[0] != undefined){

                callback(result[0]);
                return;

            }

            callback("null");

        });

    }

}

function userexists(username, callback)
{
    con.query("SELECT * FROM user WHERE UPPER(username) = \"" + username.toUpperCase() + "\"", function (err, result, fields) {
        callback(result.length > 0);
    });
}


