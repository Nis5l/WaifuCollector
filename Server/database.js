const sql = require('mysql')
const bcrypt = require('bcrypt');

const packTime = "PACKTIME";
const friend = "FRIEND";

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
            //cardTypes();
            //cards();
        });
    },

    login: function login(username , password, callback)
    {
        //SQL INJECTION
        con.query("SELECT * FROM user WHERE UPPER(username) = \"" + username.toUpperCase() +  "\"", function (err, result, fields) {
            if(result == undefined || result.length == 0)
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
            if(result == undefined || result.affectedRows == 0)
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

    },

    addFriend: function addFriend(userID, friendID)
    {
        con.query("INSERT INTO `data`(`userID`, `key`, `value`) VALUES (" + userID + ", '" + friend + "', '" + friendID + "')", function (err, result, fields) {
        });
    },

    getFriends: function getFriends(userID, callback)
    {
        con.query("SELECT * FROM data WHERE `userID` = " + userID + " AND `key` = \"" + friend +"\"", function (err, result, fields) {
            if(result == undefined || result.length == 0)
            {
                callback(null);
                return;
            }
            callback(result);
        });
    },

    userexists: function userexists(username, callback)
    {
        con.query("SELECT * FROM user WHERE UPPER(username) = \"" + username.toUpperCase() + "\"", function (err, result, fields) {
            callback(result != null && result.length > 0);
        });
    }
}

function cards()
{
    //maybe:
    //Tatsuki Arisawa
    //juvia - fairy tale
    con.connect(() =>
    {
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rem', '1', 'Card_Rem.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'ZeroTwo', '2', 'Card_ZeroTwo.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chika', '3', 'Card_Chika.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Megumin', '4', 'Card_Megumin.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akame', '5', 'Card_Akame.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Annie Leonhardt', '6', 'Card_AnnieLeonhardt.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lucy Heartfilia', '7', 'Card_LucyHeartfilia.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ram', '1', 'Card_Ram.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kashiwazaki Sena', '8', 'Card_KashiwazakiSena.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ayanami Rei', '9', 'Card_AyanamiRei.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mary Saotome', '10', 'Card_MarySaotome.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rukia Kuchiki', '11', 'Card_RukiaKuchiki.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Bishamonten', '12', 'Card_Bishamonten.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikumi Mito', '13', 'Card_IkumiMito.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ino Yamanaka', '14', 'Card_InoYamanaka.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chelsea', '5', 'Card_Chelsea.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Emilia', '1', 'Card_Emilia.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Esdeath', '5', 'Card_Esdeath.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Himiko Toga', '15', 'Card_HimikoToga.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jirou Kyouka', '15', 'Card_JirouKyouka.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikaros', '16', 'Card_Ikaros.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiina Mashiro', '17', 'Card_ShiinaMashiro.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Isla', '18', 'Card_Isla.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanade Tachibana', '19', 'Card_KanadeTachibana.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirisaki Chitoge', '20', 'Card_KirisakiChitoge.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miss Valentine', '21', 'Card_MissValentine.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurome', '5', 'Card_Kurome.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumi Tokisaki', '22', 'Card_KurumiTokisaki.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mizore', '23', 'Card_Mizore.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nami', '21', 'Card_Nami.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lieselotte Sherlock', '24', 'Card_LieselotteSherlock.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ruri', '25', 'Card_Ruri.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirigaya Suguha', '26', 'Card_KirigayaSuguha.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lan Fan', '27', 'Card_LanFan.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Leone', '5', 'Card_Leone.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mio Naruse', '28', 'Card_MioNaruse.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satsuki Momoi', '29', 'Card_SatsukiMomoi.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Koneko Toujou', '30', 'Card_KonekoToujou.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erza Scarlet', '7', 'Card_ErzaScarlet.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nao Tomori', '31', 'Card_NaoTomori.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Xenovia', '30', 'Card_Xenovia.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Raphtalia', '32', 'Card_Raphtalia.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rei Miyamoto', '33', 'Card_ReiMiyamoto.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rindo Kobayashi', '13', 'Card_RindoKobayashi.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erina Nakiri', '13', 'Card_ErinaNakiri.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nakiri Alice', '13', 'Card_NakiriAlice.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Temari', '14', 'Card_Temari.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsunade', '14', 'Card_Tsunade.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jabami Yumeko', '34', 'Card_JabamiYumeko.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirai Momobami', '34', 'Card_KiraiMomobami.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Alice Zuberg', '26', 'Card_AliceZuberg.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C18', '35', 'Card_C18.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Astil Manuscript', '24', 'Card_AstilManuscript.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachel Gardner', '36', 'Card_RachelGardner.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Camie Utsumishi', '15', 'Card_CamieUtsumishi.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C C', '37', 'Card_CC.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Darkness', '4', 'Card_Darkness.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elaine', '38', 'Card_Elaine.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Papi', '39', 'Card_Papi.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachnera Arachnera', '39', 'Card_RachneraArachnera.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asia Argento', '30', 'Card_AsiaArgento.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Irina Jelavic', '40', 'Card_IrinaJelavic.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Boa Hancock', '21', 'Card_BoaHancock.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Historia Reiss', '6', 'Card_HistoriaReiss.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hanabi Hyuga', '14', 'Card_HanabiHyuga.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaori Miyazono', '41', 'Card_KaoriMiyazono.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumu Kurono', '23', 'Card_KurumuKurono.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisesharte Atismata', '42', 'Card_LisesharteAtismata.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Moka Akashiya', '23', 'Card_MokaAkashiya.png')");
        con.query("INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ririka Momobami', '34', 'Card_RirikaMomobami.png')");
    });
}

function cardTypes()
{
    con.connect(() =>
    {
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('1', 'Re:Zero')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('2', 'DARLING in the FRANXX')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('3', 'KAGUYA-SAMA: LOVE IS WAR')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('4', 'KonoSuba')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('5', 'Akame ga Kill!')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('6', 'Attack on Titan')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('7', 'Fairy Tail')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('8', 'Boku wa Tomodachi ga Sukunai')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('9', 'Neon Genesis Evangelion')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('10', 'Kakegurui')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('11', 'Bleach')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('12', 'Noragami')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('13', 'Food Wars!')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('14', 'Naruto')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('15', 'My Hero Academia')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('16', 'Heavens Lost Property')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('17', 'Sakurasou no Pet na Kanojo')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('18', 'Plastic Memories')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('19', 'Angel Beats!')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('20', 'Nisekoi')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('21', 'One Piece')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('22', 'Date a Live')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('23', 'Rosario + Vampire')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('24', 'Trinity Seven')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('25', 'Dr. Stone')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('26', 'Sword Art Online')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('27', 'Fullmetal Alchemist')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('28', 'The Testament of Sister New Devil')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('29', 'Kuroko no Basuke')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('30', 'Highschool DxD')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('31', 'Charlotte')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('32', 'The Rising Of The Shield Hero')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('33', 'Highscool of the Dead')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('34', 'Kakeguri - Compulsive Gambler')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('35', 'Dragon Ball')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('36', 'Angels of Death')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('37', 'Code Geass')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('38', 'Seven deadly sins')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('39', 'Daily Life With A Monster Girl')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('40', 'Assassination Classroom')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('41', 'Your Lie in April')");
        con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('41', 'Undefeated Bahamut Chronicle')");
    });
}

function userexists(username, callback)
{
    con.query("SELECT * FROM user WHERE UPPER(username) = \"" + username.toUpperCase() + "\"", function (err, result, fields) {
        callback(result != null && result.length > 0);
    });
}


