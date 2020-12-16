const sql = require("mysql");
const bcrypt = require("bcrypt");

const packTime = "PACKTIME";
const friend = "FRIEND";

const config = require("./config.json");

var con = sql.createConnection({
	host: config.mysql.host,
	port: config.mysql.port,
	user: config.mysql.user,
	password: config.mysql.password,
});

module.exports = {
	init: function init(callback) {
		con.connect(() => {
			//"CREATE DATABASE IF NOT EXISTS WaifuCollector;" +
			"USE " +
				config.mysql.database +
				";" +
				"CREATE TABLE IF NOT EXISTS user ( `id` INT NOT NULL AUTO_INCREMENT , `username` TEXT NOT NULL , `password` TEXT NOT NULL , `ranking` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;" +
				"CREATE TABLE IF NOT EXISTS card ( `id` INT NOT NULL AUTO_INCREMENT , `cardName` TEXT NOT NULL , `typeID` INT NOT NULL, `cardImage` TEXT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;" +
				"CREATE TABLE IF NOT EXISTS cardtype ( `id` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;" +
				"CREATE TABLE IF NOT EXISTS unlocked ( `id` INT NOT NULL AUTO_INCREMENT , `userID` INT NOT NULL , `cardID` INT NOT NULL , `quality` INT NOT NULL , `level` INT NOT NULL DEFAULT '0' , `frameID` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;" +
				"CREATE TABLE IF NOT EXISTS data ( `id` INT NOT NULL AUTO_INCREMENT , `userID` INT NOT NULL , `key` TEXT NOT NULL , `value` LONGTEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;" +
				"CREATE TABLE IF NOT EXISTS frame ( `id` INT NOT NULL , `name` TEXT NOT NULL , `path_front` TEXT NOT NULL, `path_back` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;" +
				"CREATE TABLE IF NOT EXISTS friend ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `friend_status` INT NOT NULL ) ENGINE = InnoDB;" +
				"CREATE TABLE trade ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `card` INT NOT NULL ) ENGINE = InnoDB;" +
				"CREATE TABLE trademanager ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `statusone` INT NOT NULL , `statustwo` INT NOT NULL ) ENGINE = InnoDB;",
				(err) => {
					if (err) console.log(err);
					cardTypes(() => {
						cards(() => {
							frames(() => {
								callback();
							});
						});
					});
				};
		});
	},

	login: function login(username, password, callback) {
		//SQL INJECTION
		con.query(
			'SELECT * FROM user WHERE UPPER(username) = "' +
				username.toUpperCase() +
				'"',
			function (err, result, fields) {
				if (result == undefined || result.length == 0) {
					callback(0, "login failed", -1);
					return;
				}
				bcrypt.compare(password, result[0].password, function (err, resp) {
					callback(resp, resp ? "logged in" : "login failed", result[0].id);
				});
			}
		);
	},

	register: function register(username, password, callback) {
		userexists(username, (b) => {
			if (!b) {
				bcrypt.hash(password, 10, (err, hash) => {
					con.query(
						"INSERT INTO user (username, password, ranking) VALUES ('" +
							username +
							"', '" +
							hash +
							"', 0)",
						function (err, result, fields) {
							callback(true, "registered");
						}
					);
				});
			} else {
				callback(false, "error: user already exists");
			}
		});
	},

	getPackTime: function getPackTime(userID, res, callback) {
		con.query(
			"SELECT * FROM data WHERE `userID` = " +
				userID +
				' AND `key` = "' +
				packTime +
				'"',
			function (err, result, fields) {
				if (result == undefined || result.length == 0) {
					callback(userID, null, res);
					return;
				}
				callback(userID, result[0].value, res);
			}
		);
	},

	getPackTime: function getPackTime(userID, callback) {
		con.query(
			"SELECT * FROM data WHERE `userID` = " +
				userID +
				' AND `key` = "' +
				packTime +
				'"',
			function (err, result, fields) {
				if (result == undefined || result.length == 0) {
					callback(null);
					return;
				}
				callback(result[0].value);
			}
		);
	},

	setPackTime: function setPackTime(userID, time) {
		con.query(
			"UPDATE `data` SET `value` = '" +
				time +
				"' WHERE `data`.`userID` = " +
				userID +
				' AND `data`.`key` = "' +
				packTime +
				'"',
			function (err, result, fields) {
				if (result == undefined || result.affectedRows == 0) {
					con.query(
						"INSERT INTO `data`(`userID`, `key`, `value`) VALUES (" +
							userID +
							", '" +
							packTime +
							"', '" +
							time +
							"')",
						function (err, result, fields) {}
					);
				} else {
				}
			}
		);
	},

	getRandomCard: function getRandomCard(amount, callback) {
		con.query("SELECT * FROM `card` ORDER BY RAND() LIMIT " + amount, function (
			err,
			result,
			fields
		) {
			callback(result);
		});
	},

	getRandomFrame: function getRandomFrame(amount, callback) {
		con.query(
			"SELECT * FROM `frame` ORDER BY RAND() LIMIT " + amount,
			function (err, result, fields) {
				callback(result);
			}
		);
	},

	getUserName: function getUserName(userID, callback) {
		con.query("SELECT username FROM `user` WHERE id=" + userID, function (
			err,
			result,
			fields
		) {
			if (err) console.log(err);

			if (
				result != undefined &&
				result[0] != undefined &&
				result[0].username != undefined
			) {
				callback(result[0].username);
				return;
			}

			callback("null");
		});
	},

	addCard: function addCard(userID, cardID, quality, level, frame, callback) {
		con.query(
			"INSERT INTO `unlocked` (`id`, `userID`, `cardID`, `quality`, `level`, `frameID`) VALUES (NULL, " +
				userID +
				", " +
				cardID +
				", " +
				quality +
				", " +
				level +
				", " +
				frame +
				");",
			function (err, result, fields) {
				callback(result.insertId);
			}
		);
	},

	changePass: function changePass(username, newPass) {
		bcrypt.hash(newPass, 10, (err, hash) => {
			con.query(
				"UPDATE `user` SET `password` = '" +
					hash +
					"' WHERE `user`.`username` = \"" +
					username +
					'"',
				function (err, result, fields) {}
			);
		});
	},

	getCardType: function getCardType(typeID, callback) {
		con.query("SELECT * FROM `cardtype` WHERE id=" + typeID, function (
			err,
			result,
			fields
		) {
			if (result != undefined && result[0] != undefined) {
				callback(result[0]);
				return;
			}

			callback("null");
		});
	},

	userexists: function userexists(username, callback) {
		con.query(
			'SELECT * FROM user WHERE UPPER(username) = "' +
				username.toUpperCase() +
				'"',
			function (err, result, fields) {
				callback(result != null && result.length > 0);
			}
		);
	},

	getInventory: function getInventory(userID, callback) {
		con.query(
			"SELECT * FROM unlocked WHERE userID = " + userID,
			(err, result, fields) => {
				callback(result);
			}
		);
	},

	getCard: function getCard(cardID, callback) {
		con.query(
			"SELECT * FROM card WHERE id=" + cardID,
			(err, result, fields) => {
				callback(result[0]);
			}
		);
	},

	getFrame: function getFrame(frameID, callback) {
		con.query(
			"SELECT * FROM frame WHERE id=" + frameID,
			(err, result, fields) => {
				callback(result[0]);
			}
		);
	},

	getCards: function getCards(callback) {
		con.query("SELECT * FROM card", (err, result, fields) => {
			callback(result);
		});
	},
	getCardUUID: function getCardUUID(uuid, userID, callback) {
		con.query(
			"SELECT * FROM unlocked WHERE id=" + uuid + " AND userID=" + userID,
			(err, result, fields) => {
				if (result == undefined || result.length == 0) {
					callback(undefined);
					return;
				}
				callback(result[0]);
			}
		);
	},

	getFriends: function getFriends(userID, callback) {
		con.query(
			"SELECT * FROM `friend` WHERE userone = " +
				userID +
				" OR usertwo = " +
				userID,
			(err, result, fields) => {
				if (result == undefined || result.length == 0) {
					callback(undefined);
					return;
				}
				callback(result);
			}
		);
	},
	getUserID: function getUserID(username, callback) {
		con.query(
			"SELECT * FROM user WHERE UPPER(username) = ?",
			[username.toUpperCase()],
			function (err, result, fields) {
				console.log(result);
				if (result == undefined || result == null || result.length != 1) {
					callback(undefined);
					return;
				}
				callback(result[0].id);
			}
		);
	},
	addFriendRequest: function addFriendRequest(idone, idtwo, callback) {
		con.query(
			"INSERT INTO `friend` (`userone`, `usertwo`, `friend_status`) VALUES ('" +
				idone +
				"', '" +
				idtwo +
				"', '0')",
			function (err, result, fields) {
				callback();
			}
		);
	},
	acceptFriendRequest: function acceptFriendRequest(
		userone,
		usertwo,
		callback
	) {
		con.query(
			"UPDATE friend SET friend_status = 2 WHERE userone=" +
				userone +
				" AND usertwo=" +
				usertwo,
			function (err, result, fields) {
				callback();
			}
		);
	},
	deleteFriend: function deleteFriend(userone, usertwo, callback) {
		con.query(
			"DELETE FROM friend WHERE (userone=" +
				userone +
				" AND usertwo=" +
				usertwo +
				") OR (userone=" +
				usertwo +
				" AND usertwo=" +
				userone +
				")",
			function (err, result, fields) {
				callback();
			}
		);
	},
	getTrade: function getTrade(userone, usertwo, callback) {
		con.query(
			"SELECT * FROM trade WHERE userone=" +
				userone +
				" AND usertwo=" +
				usertwo,
			function (err, result, fields) {
				console.log(err);
				callback(result);
			}
		);
	},
	getTradesCard: function getTradesCard(card, callback) {
		con.query("SELECT * FROM trade WHERE card=" + card, function (
			err,
			result,
			fields
		) {
			if (result != undefined && result.length == 0) {
				callback(undefined);
				return;
			}
			callback(result);
		});
	},
	addTrade: function addTrade(userone, usertwo, cardID, callback) {
		con.query(
			"INSERT INTO `trade` (`userone`, `usertwo`, `card`) VALUES ('" +
				userone +
				"', '" +
				usertwo +
				"', '" +
				cardID +
				"')",
			function (err, result, fields) {
				callback(result);
			}
		);
	},
	deleteCard: function deleteCard(uuid, callback) {
		con.query("DELETE FROM unlocked WHERE id=" + uuid, function (
			err,
			result,
			fields
		) {
			callback(result);
		});
	},
	removeTrade: function removeTrade(uuid, callback) {
		con.query("DELETE FROM trade WHERE card=" + uuid, function (
			err,
			result,
			fields
		) {
			callback(result);
		});
	},
	removeTradeUser: function removeTradeUser(uuid, userone, usertwo, callback) {
		con.query(
			"DELETE FROM trade WHERE card=" +
				uuid +
				" AND userone=" +
				userone +
				" AND usertwo=" +
				usertwo,
			function (err, result, fields) {
				callback(result);
			}
		);
	},
	addTradeManager: function addTradeManager(userone, usertwo, callback) {
		con.query(
			"INSERT INTO `trademanager` (`userone`, `usertwo`, `statusone`, `statustwo`) VALUES ('" +
				userone +
				"', '" +
				usertwo +
				"', '0', '0')",
			function (err, result, fields) {
				callback(result);
			}
		);
	},
	getTradeManager: function getTradeManager(userone, usertwo, callback) {
		con.query(
			"SELECT * FROM trademanager WHERE (userone = " +
				userone +
				" AND usertwo = " +
				usertwo +
				") OR (userone = " +
				usertwo +
				" AND usertwo = " +
				userone +
				")",
			function (err, result, fields) {
				if (result != undefined && result.length == 0) {
					callback(undefined);
					return;
				}
				callback(result);
			}
		);
	},
	setTradeStatus: function setTradeStatus(userone, usertwo, status, callback) {
		con.query(
			"UPDATE trademanager SET statusone = " +
				status +
				" WHERE userone = " +
				userone +
				" AND usertwo = " +
				usertwo +
				";",
			function (err, result, fields) {
				con.query(
					"UPDATE trademanager SET statustwo = " +
						status +
						" WHERE userone = " +
						usertwo +
						" AND usertwo = " +
						userone +
						";",
					(err, result, fields) => {
						callback();
					}
				);
			}
		);
	},
	tradeExists: function tradeExists(userone, usertwo, cardID, callback) {
		con.query(
			"SELECT * FROM trade WHERE userone=" +
				userone +
				" AND usertwo=" +
				usertwo +
				" AND card=" +
				cardID,
			(err, result, fields) => {
				callback(result != undefined && result.length > 0);
			}
		);
	},
	changeCardUser: function changeCardUser(card, user, callback) {
		con.query(
			"UPDATE unlocked SET userID =" + user + " WHERE id=" + card,
			(err, result, fields) => {
				callback(result);
			}
		);
	},
};

function cards(callback) {
	//maybe:
	//Tatsuki Arisawa
	//juvia - fairy tale
	con.connect(() => {
		con.query("DROP TABLE card", () => {
			cons.query(
				"CREATE TABLE IF NOT EXISTS card ( `id` INT NOT NULL AUTO_INCREMENT , `cardName` TEXT NOT NULL , `typeID` INT NOT NULL, `cardImage` TEXT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					con.query(
						"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rem', '1', 'Card_Rem.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'ZeroTwo', '2', 'Card_ZeroTwo.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chika', '3', 'Card_Chika.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Megumin', '4', 'Card_Megumin.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akame', '5', 'Card_Akame.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Annie Leonhardt', '6', 'Card_AnnieLeonhardt.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lucy Heartfilia', '7', 'Card_LucyHeartfilia.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ram', '1', 'Card_Ram.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kashiwazaki Sena', '8', 'Card_KashiwazakiSena.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ayanami Rei', '9', 'Card_AyanamiRei.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mary Saotome', '10', 'Card_MarySaotome.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rukia Kuchiki', '11', 'Card_RukiaKuchiki.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Bishamonten', '12', 'Card_Bishamonten.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikumi Mito', '13', 'Card_IkumiMito.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ino Yamanaka', '14', 'Card_InoYamanaka.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chelsea', '5', 'Card_Chelsea.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Emilia', '1', 'Card_Emilia.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Esdeath', '5', 'Card_Esdeath.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Himiko Toga', '15', 'Card_HimikoToga.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jirou Kyouka', '15', 'Card_JirouKyouka.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikaros', '16', 'Card_Ikaros.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiina Mashiro', '17', 'Card_ShiinaMashiro.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Isla', '18', 'Card_Isla.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanade Tachibana', '19', 'Card_KanadeTachibana.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirisaki Chitoge', '20', 'Card_KirisakiChitoge.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miss Valentine', '21', 'Card_MissValentine.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurome', '5', 'Card_Kurome.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumi Tokisaki', '22', 'Card_KurumiTokisaki.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mizore', '23', 'Card_Mizore.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nami', '21', 'Card_Nami.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lieselotte Sherlock', '24', 'Card_LieselotteSherlock.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ruri', '25', 'Card_Ruri.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirigaya Suguha', '26', 'Card_KirigayaSuguha.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lan Fan', '27', 'Card_LanFan.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Leone', '5', 'Card_Leone.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mio Naruse', '28', 'Card_MioNaruse.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satsuki Momoi', '29', 'Card_SatsukiMomoi.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Koneko Toujou', '30', 'Card_KonekoToujou.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erza Scarlet', '7', 'Card_ErzaScarlet.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nao Tomori', '31', 'Card_NaoTomori.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Xenovia', '30', 'Card_Xenovia.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Raphtalia', '32', 'Card_Raphtalia.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rei Miyamoto', '33', 'Card_ReiMiyamoto.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rindo Kobayashi', '13', 'Card_RindoKobayashi.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erina Nakiri', '13', 'Card_ErinaNakiri.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nakiri Alice', '13', 'Card_NakiriAlice.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Temari', '14', 'Card_Temari.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsunade', '14', 'Card_Tsunade.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jabami Yumeko', '34', 'Card_JabamiYumeko.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirai Momobami', '34', 'Card_KiraiMomobami.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Alice Zuberg', '26', 'Card_AliceZuberg.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C18', '35', 'Card_C18.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Astil Manuscript', '24', 'Card_AstilManuscript.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachel Gardner', '36', 'Card_RachelGardner.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Camie Utsumishi', '15', 'Card_CamieUtsumishi.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C C', '37', 'Card_CC.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Darkness', '4', 'Card_Darkness.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elaine', '38', 'Card_Elaine.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Papi', '39', 'Card_Papi.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachnera Arachnera', '39', 'Card_RachneraArachnera.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asia Argento', '30', 'Card_AsiaArgento.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Irina Jelavic', '40', 'Card_IrinaJelavic.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Boa Hancock', '21', 'Card_BoaHancock.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Historia Reiss', '6', 'Card_HistoriaReiss.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hanabi Hyuga', '14', 'Card_HanabiHyuga.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaori Miyazono', '41', 'Card_KaoriMiyazono.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumu Kurono', '23', 'Card_KurumuKurono.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisesharte Atismata', '42', 'Card_LisesharteAtismata.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Moka Akashiya', '23', 'Card_MokaAkashiya.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ririka Momobami', '34', 'Card_RirikaMomobami.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Natsuki Mogi', '43', 'Card_NatsukiMogi.jpg');" +
							"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rindo Kobayashi', '6', 'Card_MikasaAckermann.jpg');",
						(err) => {
							if (err) console.log(err);
							callback();
						}
					);
				}
			);
		});
	});
}

function cardTypes(callback) {
	con.connect(() => {
		con.query("DROP TABLE cardtype", () => {
			con.query(
				"CREATE TABLE IF NOT EXISTS cardtype ( `id` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					con.query(
						"INSERT INTO `cardtype` (`id`, `name`) VALUES ('1', 'Re:Zero');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('2', 'DARLING in the FRANXX');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('3', 'KAGUYA-SAMA: LOVE IS WAR');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('4', 'KonoSuba');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('5', 'Akame ga Kill!');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('6', 'Attack on Titan');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('7', 'Fairy Tail');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('8', 'Boku wa Tomodachi ga Sukunai');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('9', 'Neon Genesis Evangelion');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('10', 'Kakegurui');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('11', 'Bleach');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('12', 'Noragami');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('13', 'Food Wars!');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('14', 'Naruto');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('15', 'My Hero Academia');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('16', 'Heavens Lost Property');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('17', 'Sakurasou no Pet na Kanojo');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('18', 'Plastic Memories');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('19', 'Angel Beats!');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('20', 'Nisekoi');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('21', 'One Piece');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('22', 'Date a Live');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('23', 'Rosario + Vampire');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('24', 'Trinity Seven');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('25', 'Dr. Stone');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('26', 'Sword Art Online');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('27', 'Fullmetal Alchemist');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('28', 'The Testament of Sister New Devil');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('29', 'Kuroko no Basuke');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('30', 'Highschool DxD');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('31', 'Charlotte');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('32', 'The Rising Of The Shield Hero');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('33', 'Highscool of the Dead');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('34', 'Kakeguri - Compulsive Gambler');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('35', 'Dragon Ball');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('36', 'Angels of Death');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('37', 'Code Geass');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('38', 'Seven deadly sins');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('39', 'Daily Life With A Monster Girl');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('40', 'Assassination Classroom');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('41', 'Your Lie in April');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('42', 'Undefeated Bahamut Chronicle');" +
							"INSERT INTO `cardtype` (`id`, `name`) VALUES ('43', 'Initial D');",
						(err) => {
							if (err) console.log(err);
							callback();
						}
					);
				}
			);
		});
	});
}

function frames(callback) {
	con.connect(() => {
		con.query("DROP TABLE frame", () => {
			con.query(
				"CREATE TABLE IF NOT EXISTS frame ( `id` INT NOT NULL , `name` TEXT NOT NULL , `path_front` TEXT NOT NULL, `path_back` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					con.query(
						"INSERT INTO `frame` (`id`, `name`, `path_front` , `path_back`) VALUES ('0', 'Silver', 'Frame_Silver_Front.png', 'Frame_Silver_Back.png')",
						(err) => {
							if (err) console.log(err);
							callback();
						}
					);
				}
			);
		});
	});
}

function userexists(username, callback) {
	con.query(
		'SELECT * FROM user WHERE UPPER(username) = "' +
			username.toUpperCase() +
			'"',
		function (err, result, fields) {
			callback(result != null && result.length > 0);
		}
	);
}
