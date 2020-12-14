const sql = require("mysql");
const bcrypt = require("bcrypt");

const packTime = "PACKTIME";
const friend = "FRIEND";

var con = sql.createConnection({
	host: "192.168.1.102",
	port: 3306,
	user: "waifucol",
	password: "Np%QdHYuRxk9fbn",
});

module.exports = {
	init: function init(callback) {
		var i = 0;
		var taskAmount = 10;
		con.connect(() => {
			//con.query("CREATE DATABASE IF NOT EXISTS WaifuCollector", () => {
			//	ontaskfinish();
			//});
			con.query("USE WaifuCollector", () => {
				ontaskfinish();
			});
			con.query(
				"CREATE TABLE IF NOT EXISTS user ( `id` INT NOT NULL AUTO_INCREMENT , `username` TEXT NOT NULL , `password` TEXT NOT NULL , `ranking` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);
			con.query(
				"CREATE TABLE IF NOT EXISTS card ( `id` INT NOT NULL AUTO_INCREMENT , `cardName` TEXT NOT NULL , `typeID` INT NOT NULL, `cardImage` TEXT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);
			con.query(
				"CREATE TABLE IF NOT EXISTS cardtype ( `id` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);
			con.query(
				"CREATE TABLE IF NOT EXISTS unlocked ( `id` INT NOT NULL AUTO_INCREMENT , `userID` INT NOT NULL , `cardID` INT NOT NULL , `quality` INT NOT NULL , `level` INT NOT NULL DEFAULT '0' , `frameID` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);
			con.query(
				"CREATE TABLE IF NOT EXISTS data ( `id` INT NOT NULL AUTO_INCREMENT , `userID` INT NOT NULL , `key` TEXT NOT NULL , `value` LONGTEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);
			con.query(
				"CREATE TABLE IF NOT EXISTS frame ( `id` INT NOT NULL , `name` TEXT NOT NULL , `path_front` TEXT NOT NULL, `path_back` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);
			con.query(
				"CREATE TABLE IF NOT EXISTS friend ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `friend_status` INT NOT NULL ) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);

			con.query(
				"CREATE TABLE `waifucollector`.`trade` ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `card` INT NOT NULL ) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);

			con.query(
				"CREATE TABLE `waifucollector`.`trademanager` ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `statusone` INT NOT NULL , `statustwo` INT NOT NULL ) ENGINE = InnoDB;",
				() => {
					ontaskfinish();
				}
			);

			function ontaskfinish() {
				i++;
				if (i == taskAmount) callback();
			}
			//cardTypes();
			//cards();
			//frames();
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
				//console.log(err);
				//console.log(result);
				//console.log(fields);
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

function cards() {
	//maybe:
	//Tatsuki Arisawa
	//juvia - fairy tale
	con.connect(() => {
		//con.query("DROP TABLE card", () => {
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rem', '1', 'Card_Rem.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'ZeroTwo', '2', 'Card_ZeroTwo.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chika', '3', 'Card_Chika.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Megumin', '4', 'Card_Megumin.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akame', '5', 'Card_Akame.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Annie Leonhardt', '6', 'Card_AnnieLeonhardt.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lucy Heartfilia', '7', 'Card_LucyHeartfilia.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ram', '1', 'Card_Ram.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kashiwazaki Sena', '8', 'Card_KashiwazakiSena.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ayanami Rei', '9', 'Card_AyanamiRei.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mary Saotome', '10', 'Card_MarySaotome.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rukia Kuchiki', '11', 'Card_RukiaKuchiki.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Bishamonten', '12', 'Card_Bishamonten.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikumi Mito', '13', 'Card_IkumiMito.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ino Yamanaka', '14', 'Card_InoYamanaka.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chelsea', '5', 'Card_Chelsea.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Emilia', '1', 'Card_Emilia.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Esdeath', '5', 'Card_Esdeath.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Himiko Toga', '15', 'Card_HimikoToga.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jirou Kyouka', '15', 'Card_JirouKyouka.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikaros', '16', 'Card_Ikaros.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiina Mashiro', '17', 'Card_ShiinaMashiro.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Isla', '18', 'Card_Isla.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanade Tachibana', '19', 'Card_KanadeTachibana.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirisaki Chitoge', '20', 'Card_KirisakiChitoge.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miss Valentine', '21', 'Card_MissValentine.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurome', '5', 'Card_Kurome.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumi Tokisaki', '22', 'Card_KurumiTokisaki.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mizore', '23', 'Card_Mizore.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nami', '21', 'Card_Nami.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lieselotte Sherlock', '24', 'Card_LieselotteSherlock.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ruri', '25', 'Card_Ruri.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirigaya Suguha', '26', 'Card_KirigayaSuguha.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lan Fan', '27', 'Card_LanFan.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Leone', '5', 'Card_Leone.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mio Naruse', '28', 'Card_MioNaruse.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satsuki Momoi', '29', 'Card_SatsukiMomoi.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Koneko Toujou', '30', 'Card_KonekoToujou.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erza Scarlet', '7', 'Card_ErzaScarlet.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nao Tomori', '31', 'Card_NaoTomori.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Xenovia', '30', 'Card_Xenovia.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Raphtalia', '32', 'Card_Raphtalia.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rei Miyamoto', '33', 'Card_ReiMiyamoto.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rindo Kobayashi', '13', 'Card_RindoKobayashi.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erina Nakiri', '13', 'Card_ErinaNakiri.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nakiri Alice', '13', 'Card_NakiriAlice.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Temari', '14', 'Card_Temari.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsunade', '14', 'Card_Tsunade.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jabami Yumeko', '34', 'Card_JabamiYumeko.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirai Momobami', '34', 'Card_KiraiMomobami.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Alice Zuberg', '26', 'Card_AliceZuberg.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C18', '35', 'Card_C18.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Astil Manuscript', '24', 'Card_AstilManuscript.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachel Gardner', '36', 'Card_RachelGardner.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Camie Utsumishi', '15', 'Card_CamieUtsumishi.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C C', '37', 'Card_CC.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Darkness', '4', 'Card_Darkness.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elaine', '38', 'Card_Elaine.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Papi', '39', 'Card_Papi.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachnera Arachnera', '39', 'Card_RachneraArachnera.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asia Argento', '30', 'Card_AsiaArgento.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Irina Jelavic', '40', 'Card_IrinaJelavic.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Boa Hancock', '21', 'Card_BoaHancock.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Historia Reiss', '6', 'Card_HistoriaReiss.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hanabi Hyuga', '14', 'Card_HanabiHyuga.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaori Miyazono', '41', 'Card_KaoriMiyazono.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumu Kurono', '23', 'Card_KurumuKurono.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisesharte Atismata', '42', 'Card_LisesharteAtismata.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Moka Akashiya', '23', 'Card_MokaAkashiya.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ririka Momobami', '34', 'Card_RirikaMomobami.jpg')"
			);
			con.query(
				"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Natsuki Mogi', '43', 'Card_NatsukiMogi.jpg')"
			);
		//});
	});
}

function cardTypes() {
	con.connect(() => {
		con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('1', 'Re:Zero')");
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('2', 'DARLING in the FRANXX')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('3', 'KAGUYA-SAMA: LOVE IS WAR')"
		);
		con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('4', 'KonoSuba')");
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('5', 'Akame ga Kill!')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('6', 'Attack on Titan')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('7', 'Fairy Tail')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('8', 'Boku wa Tomodachi ga Sukunai')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('9', 'Neon Genesis Evangelion')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('10', 'Kakegurui')"
		);
		con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('11', 'Bleach')");
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('12', 'Noragami')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('13', 'Food Wars!')"
		);
		con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('14', 'Naruto')");
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('15', 'My Hero Academia')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('16', 'Heavens Lost Property')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('17', 'Sakurasou no Pet na Kanojo')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('18', 'Plastic Memories')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('19', 'Angel Beats!')"
		);
		con.query("INSERT INTO `cardtype` (`id`, `name`) VALUES ('20', 'Nisekoi')");
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('21', 'One Piece')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('22', 'Date a Live')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('23', 'Rosario + Vampire')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('24', 'Trinity Seven')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('25', 'Dr. Stone')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('26', 'Sword Art Online')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('27', 'Fullmetal Alchemist')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('28', 'The Testament of Sister New Devil')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('29', 'Kuroko no Basuke')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('30', 'Highschool DxD')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('31', 'Charlotte')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('32', 'The Rising Of The Shield Hero')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('33', 'Highscool of the Dead')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('34', 'Kakeguri - Compulsive Gambler')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('35', 'Dragon Ball')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('36', 'Angels of Death')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('37', 'Code Geass')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('38', 'Seven deadly sins')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('39', 'Daily Life With A Monster Girl')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('40', 'Assassination Classroom')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('41', 'Your Lie in April')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('42', 'Undefeated Bahamut Chronicle')"
		);
		con.query(
			"INSERT INTO `cardtype` (`id`, `name`) VALUES ('43', 'Initial D')"
		);
	});
}

function frames() {
	con.connect(() => {
		con.query(
			"INSERT INTO `frame` (`id`, `name`, `path_front` , `path_back`) VALUES ('0', 'Silver', 'Frame_Silver_Front.png', 'Frame_Silver_Back.png')"
		);
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
