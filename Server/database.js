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
            con.query("CREATE TABLE IF NOT EXISTS user ( `UserID` INT NOT NULL AUTO_INCREMENT , `Username` TEXT NOT NULL , `Password` TEXT NOT NULL , `Rank` INT NOT NULL , PRIMARY KEY (`UserID`)) ENGINE = InnoDB;");
            con.query("CREATE TABLE IF NOT EXISTS card ( `CardID` INT NOT NULL AUTO_INCREMENT , `CardName` TEXT NOT NULL , `CardTypeID` INT NOT NULL , `CardDescription` LONGTEXT NOT NULL , `CardImage` TEXT NOT NULL, PRIMARY KEY (`CardID`)) ENGINE = InnoDB;");
            con.query("CREATE TABLE IF NOT EXISTS cardtype ( `CardTypeID` INT NOT NULL AUTO_INCREMENT , `CardTypeSeries` TEXT NOT NULL , PRIMARY KEY (`CardTypeID`)) ENGINE = InnoDB;");
            con.query("CREATE TABLE IF NOT EXISTS unlocked ( `UnlockedID` INT NOT NULL AUTO_INCREMENT , `UnlockedUserID` INT NOT NULL , `UnlockedCardID` INT NOT NULL , `UnlockedCardQuality` INT NOT NULL , PRIMARY KEY (`UnlockedID`)) ENGINE = InnoDB;");
            con.query("CREATE TABLE IF NOT EXISTS userdata ( `UserDataUserID` INT NOT NULL , `UserDataPackTime` BIGINT NOT NULL , PRIMARY KEY (`UserDataUserID`)) ENGINE = InnoDB;");
        });
    },

    login: function login(username , password)
    {
        con.query("SELECT * FROM user", function (err, result, fields) {
            //console.log(result);
        });
        return true;
    },

    register: function register(username , password)
    {
        if(userexists(username)) return false;
        
        console.log("end")

        con.query("INSERT INTO user (Username, Password, Rank) VALUES ('" + username + "', '" + password + "', 0)", function (err, result, fields) {
            //console.log(result);
        });
        return true;
    }
}
//------------------------------------
//              TODO
//  get net weil di querys async san
//------------------------------------

function userexists(username)
{
    //escape
    con.query("SELECT * FROM user WHERE Username = \"" + username + "\"", function (err, result, fields) {
        console.log("len: " + result.length);
        console.log(result.length > 0);
        return result.length > 0;
    });
}