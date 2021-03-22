const sql = require("mysql");
const bcrypt = require("bcrypt");

const packTime = "PACKTIME";
const tradeTime = "TRADETIME";

const config = require("./config.json");

var con = sql.createConnection({
	host: config.mysql.host,
	port: config.mysql.port,
	user: config.mysql.user,
	password: config.mysql.password,
});

module.exports = {
	init: function init(callback) {
		console.log("Initializing Tables");
		var sql = [
			//"CREATE DATABASE IF NOT EXISTS WaifuCollector;" +
			"USE " + config.mysql.database + ";",
			"CREATE TABLE IF NOT EXISTS `user` ( `id` INT NOT NULL AUTO_INCREMENT , `username` TEXT NOT NULL , `password` TEXT NOT NULL , `ranking` INT NOT NULL , `email` TEXT NOT NULL, `verified` INT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `card` ( `id` INT NOT NULL AUTO_INCREMENT , `cardName` TEXT NOT NULL , `typeID` INT NOT NULL, `cardImage` TEXT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `cardtype` ( `id` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `unlocked` ( `id` INT NOT NULL AUTO_INCREMENT , `userID` INT NOT NULL , `cardID` INT NOT NULL , `quality` INT NOT NULL , `level` INT NOT NULL DEFAULT '0' , `frameID` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `data` ( `id` INT NOT NULL AUTO_INCREMENT , `userID` INT NOT NULL , `key` TEXT NOT NULL , `value` LONGTEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `frame` ( `id` INT NOT NULL , `name` TEXT NOT NULL , `path_front` TEXT NOT NULL, `path_back` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `friend` ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `friend_status` INT NOT NULL ) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `trade` ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `card` INT NOT NULL ) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `trademanager` ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `statusone` INT NOT NULL , `statustwo` INT NOT NULL) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `notification` ( `id` INT NOT NULL AUTO_INCREMENT, userID INT NOT NULL, `title` TEXT NOT NULL, `message` TEXT NOT NULL, `url` TEXT NOT NULL, PRIMARY KEY (`id`))",
			"CREATE TABLE IF NOT EXISTS `effect` ( `id` INT NOT NULL ,`path` TEXT NOT NULL, `opacity` FLOAT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `packdata` ( `amount` INT NOT NULL , `time` BIGINT NOT NULL , PRIMARY KEY (`time`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `tradesuggestion` ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `card` INT NOT NULL ) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `verificationkey` ( `userID` INT NOT NULL , `key` TEXT NOT NULL , PRIMARY KEY (`userID`)) ENGINE = InnoDB;"
			//ALTER TABLE user
			//ADD COLUMN email TEXT NOT NULL,
			//ADD COLUMN verified INT NOT NULL;
		];

		con.connect(() => {
			console.log("Initializing Tables");
			executeArray(sql, () => {
				console.log("Initializing Cards");
				cards(() => {
					console.log("Initializing CardTypes");
					cardTypes(() => {
						console.log("Initializing Frames");
						frames(() => {
							console.log("Initializing Effects");
							effects(() => {
								console.log("Using DB");
								con.query("USE " + config.mysql.database + ";", () => {
									callback();
								});
							});
						});
					});
				});
			});
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
		con.query(
			"SELECT * FROM `card` ORDER BY RAND() LIMIT " + amount,
			function (err, result, fields) {
				callback(result);
			}
		);
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
		con.query(
			"SELECT username FROM `user` WHERE id=" + userID,
			function (err, result, fields) {
				if (err) console.log(err);
				if (
					result != undefined &&
					result[0] != undefined &&
					result[0].username != undefined
				) {
					callback(result[0].username);
					return;
				}

				callback(null);
			}
		);
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
		con.query(
			"SELECT * FROM `cardtype` WHERE id=" + typeID,
			function (err, result, fields) {
				if (result != undefined && result[0] != undefined) {
					callback(result[0]);
					return;
				}

				callback("null");
			}
		);
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
				if (result != undefined) {
					callback(result[0]);
				} else {
					callback(undefined);
				}
			}
		);
	},
	getCardDisplay: function getCardDisplay(cardID, callback) {
		con.query(
			"SELECT card.id AS id, card.cardName AS name, card.cardImage AS image, cardtype.name AS animeName, cardtype.id AS animeID FROM `card` INNER JOIN cardtype ON card.typeID = cardtype.id WHERE card.id = " +
			cardID,
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

	registerCard: function registerCard(name, typeID, image, callback) {
		con.query(
			"INSERT INTO `card` (`cardName`, `typeID`, `cardImage`) VALUES (?, ?, ?)",
			[name, typeID, image],
			(err, result, fields) => {
				if (!err) {
					callback(true);
					return;
				}

				callback(false);
			}
		);
	},

	updateCardName: function (cardID, cardName) {
		con.query(
			"UPDATE `card` SET `cardName`=? WHERE `id`=?",
			[cardName, cardID],
			(err, result, fields) => {
				return err;
			}
		);
	},
	updateCardAnime: function (cardID, cardAnime) {
		con.query(
			"UPDATE `card` SET `typeID`=? WHERE `id`=?",
			[cardAnime, cardID],
			(err, result, fields) => {
				return err;
			}
		);
	},
	getCardsDisplay: function getCardsDisplay(callback) {
		con.query(
			'SELECT card.id AS "cardID", cardName AS "name", cardImage AS "image", cardtype.name AS anime  FROM `card` INNER JOIN cardtype On card.typeID = cardtype.id',
			(err, result, fields) => {
				callback(result);
			}
		);
	},
	getCards: function getCards(callback) {
		con.query("SELECT * FROM card", (err, result, fields) => {
			callback(result);
		});
	},
	getAnimes: function getAnimes(callback) {
		con.query("SELECT * FROM cardtype", (err, result, fields) => {
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
	isFriendPending: function getFriends(userID, userID2, callback) {
		con.query(
			"SELECT * FROM `friend` WHERE (userone = " +
			userID +
			" AND usertwo = " +
			userID2 +
			") OR (userone = " +
			userID2 +
			" AND usertwo = " +
			userID +
			");",
			(err, result, fields) => {
				if (err) console.log(err);
				if (result == undefined || result.length == 0) {
					callback(false);
					return;
				}
				callback(true);
			}
		);
	},
	getUsers: function getUsers(callback) {
		con.query(
			"SELECT id, username AS name, ranking FROM user",
			function (err, result, fields) {
				if (result == undefined) {
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
				if (err) console.log(err);
				callback(result);
			}
		);
	},
	getTradeSuggestions: function getTradeSuggestions(userone, usertwo, callback) {
		con.query(
			"SELECT * FROM tradesuggestion WHERE userone=" +
			userone +
			" AND usertwo=" +
			usertwo,
			function (err, result, fields) {
				if (err) console.log(err);
				callback(result);
			}
		);
	},
	getTradesCard: function getTradesCard(card, callback) {
		con.query(
			"SELECT * FROM trade WHERE card=" + card,
			function (err, result, fields) {
				if (result != undefined && result.length == 0) {
					callback(undefined);
					return;
				}
				callback(result);
			}
		);
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
	addTradeSuggestion: function addTradeSuggestion(userone, usertwo, cardID, callback) {
		con.query(
			"INSERT INTO `tradesuggestion` (`userone`, `usertwo`, `card`) VALUES ('" +
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
		con.query(
			"DELETE FROM unlocked WHERE id=" + uuid,
			function (err, result, fields) {
				callback(result);
			}
		);
	},
	removeTrade: function removeTrade(uuid, callback) {
		con.query(
			"DELETE FROM trade WHERE card=" + uuid,
			function (err, result, fields) {
				callback(result);
			}
		);
	},
	removeSuggestion: function removeSuggestion(uuid, callback) {
		con.query(
			"DELETE FROM tradesuggestion WHERE card=" + uuid,
			function (err, result, fields) {
				callback(result);
			}
		);
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
	removeSuggestionUser: function removeSuggestionUser(userone, usertwo, uuid, callback) {
		con.query(
			"DELETE FROM tradesuggestion WHERE card=" +
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
				if (err) console.log(err);
				con.query(
					"UPDATE trademanager SET statustwo = " +
					status +
					" WHERE userone = " +
					usertwo +
					" AND usertwo = " +
					userone +
					";",
					(err, result, fields) => {
						if (err) console.log(err);
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
	tradeSuggestionExists: function tradeSuggestionExists(userone, usertwo, cardID, callback) {
		con.query(
			"SELECT * FROM tradesuggestion WHERE userone=" +
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
	tradeCount: function tradeCount(user, usertwo, callback) {
		con.query(
			"SELECT * FROM trade WHERE userone=" +
			userone +
			" AND usertwo=" +
			usertwo +
			";",
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
	getUserRank: function getUserRank(userID, callback) {
		con.query(
			"SELECT ranking FROM user WHERE id=" + userID,
			(err, result, fields) => {
				if (result == undefined || result.length == 0) {
					callback(undefined);
					return;
				}
				callback(result[0].ranking);
			}
		);
	},
	addNotification: function addNotification(
		userID,
		title,
		message,
		url,
		callback
	) {
		con.query(
			"INSERT INTO notification(`userID`, `title`, `message`, `url`)" +
			" SELECT '" +
			userID +
			"', '" +
			title +
			"', '" +
			message +
			"', '" +
			url +
			"' FROM dual WHERE NOT EXISTS" +
			" ( SELECT * FROM notification WHERE" +
			" userID = '" +
			userID +
			"' AND title = '" +
			title +
			"' AND url = '" +
			url +
			"');",
			(err, result, fields) => {
				if (err) console.log(err);
				callback(result);
			}
		);
	},
	getNotifications: function getNotifications(userID, callback) {
		con.query(
			"SELECT * FROM notification WHERE userID = " + userID + ";",
			(err, result, fields) => {
				if (err) console.log(err);
				callback(result);
			}
		);
	},
	removeNotification: function removeNotification(
		notificationID,
		userID,
		callback
	) {
		con.query(
			"DELETE FROM notification WHERE id = " +
			notificationID +
			" AND userID = " +
			userID +
			";",
			(err, result, fields) => {
				if (err) console.log(err);
				callback(result);
			}
		);
	},
	removeNotifications: function removeNotifications(userID, callback) {
		con.query(
			"DELETE FROM notification WHERE userID = " + userID + ";",
			(err, result, fields) => {
				if (err) console.log(err);
				callback(result);
			}
		);
	},
	setTradeTime: function setTradeTime(userID, time) {
		con.query(
			"UPDATE `data` SET `value` = '" +
			time +
			"' WHERE `data`.`userID` = " +
			userID +
			' AND `data`.`key` = "' +
			tradeTime +
			'"',
			function (err, result, fields) {
				if (result == undefined || result.affectedRows == 0) {
					con.query(
						"INSERT INTO `data`(`userID`, `key`, `value`) VALUES (" +
						userID +
						", '" +
						tradeTime +
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
	getTradeTime: function getTradeTime(userID, callback) {
		con.query(
			"SELECT * FROM data WHERE `userID` = " +
			userID +
			' AND `key` = "' +
			tradeTime +
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
	getEffect: function getEffect(level, callback) {
		con.query(
			"SELECT * FROM effect WHERE `id` = " + level + ";",
			function (err, result, fields) {
				if (result == undefined || result.length == 0) {
					callback(null, 1);
					return;
				}
				callback(result[0].path, result[0].opacity);
			}
		);
	},
	addPackData: function addPackData(time, callback) {
		con.query("INSERT INTO `packdata` ( `amount`, `time`) values ( 1, " + time + ") ON DUPLICATE KEY UPDATE amount = amount + 1;",
			(err, result, fields) => {
				if (callback != undefined) callback();
			})
	},
	getPackDataRange: function getPackDataRange(floor, ceil, callback) {
		con.query("SELECT * FROM packdata WHERE time BETWEEN " + floor + " AND " + ceil + ";", (err, result, fields) => {
			if (callback != undefined) callback(result);
		});
	},
	getMailVerified: function getMailVerified(userID, callback) {
		con.query(
			"SELECT email, verified FROM `user` WHERE id=" + userID,
			function (err, result, fields) {
				if (err) console.log(err);
				if (
					result != undefined &&
					result[0] != undefined
				) {
					callback(result[0]);
					return;
				}
				callback(null);
			}
		);
	},
	setMail: function setMail(userID, mail, callback) {
		con.query(
			`UPDATE user SET email="${mail}" WHERE id=${userID}`,
			function (err, result, fields) {
				callback();
			}
		);
	},
	setVerificationKey: function setVerificationKey(userID, key, callback) {
		con.query(`DELETE FROM verificationkey WHERE userID=${userID}`, (err, result, fields) => {
			con.query(`INSERT INTO verificationkey (\`userID\`, \`key\`) values (${userID}, "${key}")`, (err, result, fields) => {
				callback();
			});
		});
	},
	deleteVerificationKey: function deleteVerificationKey(userID, callback) {
		con.query(`DELETE FROM verificationkey WHERE userID=${userID}`, (err, result, fields) => {
			callback();
		});
	},
	getVerificationKey: function getVerificationKey(userID, callback) {
		con.query(`SELECT \`key\` FROM verificationkey WHERE userID=${userID}`, (err, result, fields) => {
			if (result != undefined && result[0] != undefined) {
				callback(result[0].key);
				return;
			}
			callback(null);
		});
	},
	setVerified: function setVerified(userID, verified, callback) {
		con.query(`UPDATE user SET verified=${verified} WHERE id=${userID}`, (err, result, fields) => {
			callback();
		});
	},
	mailExists: function mailExists(mail, callback) {
		con.query(
			`SELECT * FROM \`user\` WHERE email="${mail}"`,
			function (err, result, fields) {
				if (err) console.log(err);
				if (
					result != undefined &&
					result[0] != undefined &&
					result.length > 0
				) {
					callback(true);
					return;
				}
				callback(false);
			}
		);
	}
};

function cards(callback) {
	//maybe:
	//Tatsuki Arisawa
	//juvia - fairy tale
	var sql = [
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rem', '1', 'Card_Rem.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'ZeroTwo', '2', 'Card_ZeroTwo.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chika', '3', 'Card_Chika.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Megumin', '4', 'Card_Megumin.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akame', '5', 'Card_Akame.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Annie Leonhardt', '6', 'Card_AnnieLeonhardt.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lucy Heartfilia', '7', 'Card_LucyHeartfilia.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ram', '1', 'Card_Ram.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kashiwazaki Sena', '8', 'Card_KashiwazakiSena.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ayanami Rei', '9', 'Card_AyanamiRei.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mary Saotome', '10', 'Card_MarySaotome.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rukia Kuchiki', '11', 'Card_RukiaKuchiki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Bishamonten', '12', 'Card_Bishamonten.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikumi Mito', '13', 'Card_IkumiMito.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ino Yamanaka', '14', 'Card_InoYamanaka.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chelsea', '5', 'Card_Chelsea.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Emilia', '1', 'Card_Emilia.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Esdeath', '5', 'Card_Esdeath.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Himiko Toga', '15', 'Card_HimikoToga.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jirou Kyouka', '15', 'Card_JirouKyouka.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikaros', '16', 'Card_Ikaros.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiina Mashiro', '17', 'Card_ShiinaMashiro.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Isla', '18', 'Card_Isla.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanade Tachibana', '19', 'Card_KanadeTachibana.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirisaki Chitoge', '20', 'Card_KirisakiChitoge.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miss Valentine', '21', 'Card_MissValentine.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurome', '5', 'Card_Kurome.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumi Tokisaki', '22', 'Card_KurumiTokisaki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mizore', '23', 'Card_Mizore.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nami', '21', 'Card_Nami.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lieselotte Sherlock', '24', 'Card_LieselotteSherlock.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ruri', '25', 'Card_Ruri.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirigaya Suguha', '26', 'Card_KirigayaSuguha.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lan Fan', '27', 'Card_LanFan.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Leone', '5', 'Card_Leone.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mio Naruse', '28', 'Card_MioNaruse.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satsuki Momoi', '29', 'Card_SatsukiMomoi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Koneko Toujou', '30', 'Card_KonekoToujou.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erza Scarlet', '7', 'Card_ErzaScarlet.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nao Tomori', '31', 'Card_NaoTomori.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Xenovia', '30', 'Card_Xenovia.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Raphtalia', '32', 'Card_Raphtalia.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rei Miyamoto', '33', 'Card_ReiMiyamoto.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rindo Kobayashi', '13', 'Card_RindoKobayashi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erina Nakiri', '13', 'Card_ErinaNakiri.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nakiri Alice', '13', 'Card_NakiriAlice.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Temari', '14', 'Card_Temari.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsunade', '14', 'Card_Tsunade.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jabami Yumeko', '10', 'Card_JabamiYumeko.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirai Momobami', '10', 'Card_KiraiMomobami.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Alice Zuberg', '26', 'Card_AliceZuberg.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C18', '35', 'Card_C18.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Astil Manuscript', '24', 'Card_AstilManuscript.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachel Gardner', '36', 'Card_RachelGardner.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Camie Utsumishi', '15', 'Card_CamieUtsumishi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C C', '37', 'Card_CC.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Darkness', '4', 'Card_Darkness.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elaine', '38', 'Card_Elaine.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Papi', '39', 'Card_Papi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachnera Arachnera', '39', 'Card_RachneraArachnera.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asia Argento', '30', 'Card_AsiaArgento.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Irina Jelavic', '40', 'Card_IrinaJelavic.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Boa Hancock', '21', 'Card_BoaHancock.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Historia Reiss', '6', 'Card_HistoriaReiss.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hanabi Hyuga', '14', 'Card_HanabiHyuga.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaori Miyazono', '41', 'Card_KaoriMiyazono.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumu Kurono', '23', 'Card_KurumuKurono.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisesharte Atismata', '42', 'Card_LisesharteAtismata.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Moka Akashiya', '23', 'Card_MokaAkashiya.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ririka Momobami', '10', 'Card_RirikaMomobami.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Natsuki Mogi', '43', 'Card_NatsukiMogi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mikasa Ackermann', '6', 'Card_MikasaAckermann.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Aqua', '4', 'Card_Aqua.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shokuhou Misaki', '44', 'Card_ShokuhouMisaki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mikoto Misaka', '44', 'Card_MikotoMisaka.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanzaki Kaori', '45', 'Card_KanzakiKaori.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Julis Riessfeld', '46', 'Card_JulisRiessfeld.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mine', '5', 'Card_Mine.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Toudou Kirin', '46', 'Card_ToudouKirin.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Claudia Enfield', '46', 'Card_ClaudiaEnfield.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sasamiya Saya', '46', 'Card_SasamiyaSaya.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Toka Kirishima', '47', 'Card_TokaKirishima.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tohru', '48', 'Card_Tohru.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanna Kamui', '48', 'Card_KannaKamui.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lucoa', '48', 'Card_Lucoa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elma', '48', 'Card_Elma.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ichigo', '2', 'Card_Ichigo.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Runa Yomozuki', '10', 'Card_RunaYomozuki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuriko Nishinotouin', '10', 'Card_YurikoNishinotouin.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yumemite Yumemi', '10', 'Card_YumemiteYumemi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shizue Izawa', '50', 'Card_ShizueIzawa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rias Gremory', '30', 'Card_RiasGremory.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hinata Hyuga', '14', 'Card_HinataHyuga.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asuna Yuuki', '26', 'Card_AsunaYuuki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chizuru Mizuhara', '51', 'Card_ChizuruMizuhara.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ruka Sarashina', '51', 'Card_RukaSarashina.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mami Nanami', '51', 'Card_MamiNanami.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sumi Sakurasawa', '51', 'Card_SumiSakurasawa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rin Tohsaka', '52', 'Card_RinTohsaka.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Misa Amane', '53', 'Card_MisaAmane.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shinoa Hiragi', '54', 'Card_ShinoaHiragi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nezuko Kamado', '55', 'Card_NezukoKamado.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Saber', '52', 'Card_ArtoriaPendragon.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Violet Evergarden', '56', 'Card_VioletEvergarden.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuna', '57', 'Card_Yuna.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Momoka Sonokawa', '58', 'Card_MomokaSonokawa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miou Ootori', '58', 'Card_MiouOotori.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Maya Kyodo', '58', 'Card_MayaKyodo.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Urara Kasugano', '58', 'Card_UraraKasugano.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yui', '19', 'Card_Yui.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuri Nakamura', '19', 'Card_YuriNakamura.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Eri Shiina', '19', 'Card_EriShiina.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hestia', '59', 'Card_Hestia.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yamato Mikoto', '59', 'Card_YamatoMikoto.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sanjouno Haruhime', '59', 'Card_SanjounoHaruhime.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ais Wallenstein', '59', 'Card_AisWallenstein.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Syr Flova', '59', 'Card_SyrFlova.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ryuu Lion', '59', 'Card_RyuuLion.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Eina Tulle', '59', 'Card_EinaTulle.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaguya Shinomiya', '3', 'Card_KaguyaShinomiya.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mai Sakurajima', '60', 'Card_MaiSakurajima.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaname Arisugawa', '61', 'Card_KanameArisugawa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Aya Arisugawa', '61', 'Card_AyaArisugawa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsukasa Tsukuyomi', '61', 'Card_TsukasaTsukuyomi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Maki Oze', '62', 'Card_MakiOze.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Noel Niihashi', '11', 'Card_NoelNiihashi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiba Miyuki', '63', 'Card_ShibaMiyuki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sayaka Kirasaka', '64', 'Card_SayakaKirasaka.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Venessa Anoteca', '65', 'Card_VenessaAnoteca.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elaina', '66', 'Card_Elaina.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Echidna', '1', 'Card_Echidna.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Noelle Silva', '65', 'Card_NoelleSilva.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Charlotte Roselei', '65', 'Card_CharlotteRoselei.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nero', '65', 'Card_Nero.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mimosa Vermillion', '65', 'Card_MimosaVermillion.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hana Uzaki', '67', 'Card_HanaUzaki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ichika Nakano', '68', 'Card_IchikaNakano.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nino Nakano', '68', 'Card_NinoNakano.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miku Nakano', '68', 'Card_MikuNakano.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yotsuba Nakano', '68', 'Card_YotsubaNakano.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Itsuki Nakano', '68', 'Card_ItsukiNakano.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hori Kyouko', '69', 'Card_HoriKyouko.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Cyan', '70', 'Card_Cyan.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kohaku', '25', 'Card_Kohaku.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shinobu Oshino', '71', 'Card_ShinobuOshino.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Suruga Kanbaru', '71', 'Card_SurugaKanbaru.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsubasa Hanekawa', '71', 'Card_TsubasaHanekawa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ougi Oshino', '71', 'Card_OugiOshino.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Izuko Gaen', '71', 'Card_IzukoGaen.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ryuko Matoi', '72', 'Card_RyukoMatoi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satsuki Kiryuin', '72', 'Card_SatsukiKiryuin.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nui Harime', '72', 'Card_NuiHarime.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mako Mankanshoku', '72', 'Card_MakoMankanshoku.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nonon Jakuzure', '72', 'Card_NononJakuzure.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kokoro', '2', 'Card_Kokoro.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miku', '2', 'Card_Miku.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikuno', '2', 'Card_Ikuno.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, '001', '2', 'Card_001.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Aina Ardebit', '73', 'Card_AinaArdebit.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Phosphophyllite', '74', 'Card_Phosphophyllite.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Cinnabar', '74', 'Card_Cinnabar.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Diamond', '74', 'Card_Diamond.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Swindler', '75', 'Card_Swindler.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Seras Victoria', '76', 'Card_SerasVictoria.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiki Ryougi', '77', 'Card_ShikiRyougi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asuka Langley Sohryu', '9', 'Card_AsukaLangleySohryu.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Misato Katsuragi', '9', 'Card_MisatoKatsuragi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Stephanie Dola', '78', 'Card_StephanieDola.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jibril', '78', 'Card_Jibril.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ochako Uraraka', '15', 'Card_OchakoUraraka.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsuyu Asui', '15', 'Card_TsuyuAsui.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Momo Yaoyorozu', '15', 'Card_MomoYaoyorozu.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nejire Hado', '15', 'Card_NejireHado.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mei Hatsume', '15', 'Card_MeiHatsume.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Roxy Migurdia', '79', 'Card_RoxyMigurdia.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Eris Boreas Greyrat', '79', 'Card_ErisBoreasGreyrat.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ghislaine Dedoldia', '79', 'Card_GhislaineDedoldia.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sylphiette', '79', 'Card_Sylphiette.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Robert E O Speedwagon', '80', 'Card_RobertEOSpeedwagon.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sakura Matou', '52', 'Card_SakuraMatou.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuuna Yunohana', '81', 'Card_YuunaYunohana.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Amane Suou', '82', 'Card_AmaneSuou.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yumiko Sakaki', '82', 'Card_YumikoSakaki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Michiru Matsushima', '82', 'Card_MichiruMatsushima.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sachi Komine', '82', 'Card_SachiKomine.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Makina Irisu', '82', 'Card_MakinaIrisu.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kazuki Kazami', '82', 'Card_KazukiKazami.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akeno Himejima', '30', 'Card_AkenoHimejima.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ravel Phoenix', '30', 'Card_RavelPhoenix.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Albedo', '83', 'Card_Albedo.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisa Lisa', '80', 'Card_LisaLisa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Trish Una', '80', 'Card_TrishUna.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yukako Yamagishi', '80', 'Card_YukakoYamagishi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yoruichi Shihoin', '11', 'Card_YoruichiShihoin.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nemu Kurotsuchi', '11', 'Card_NemuKurotsuchi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sode no Shirayuki', '11', 'Card_SodenoShirayuki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nelliel Tu Odelschwanck', '11', 'Card_NellielTuOdelschwanck.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tier Harribel', '11', 'Card_TierHarribel.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Cyan Sung-Sun', '11', 'Card_CyanSung-Sun.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisa Yadomaru', '11', 'Card_LisaYadomaru.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hiyori Sarugaki', '11', 'Card_HiyoriSarugaki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Charmy Pappitson', '65', 'Card_CharmyPappitson.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Vanica Zogratis', '65', 'Card_VanicaZogratis.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Fana', '65', 'Card_Fana.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sister Lily', '65', 'Card_SisterLily.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Dorothy Unsworth', '65', 'Card_DorothyUnsworth.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sol Marron', '65', 'Card_SolMarron.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nico Robin', '21', 'Card_NicoRobin.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shirahoshi', '21', 'Card_Shirahoshi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nefeltari Vivi', '21', 'Card_NefeltariVivi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Carrot', '21', 'Card_Carrot.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Charlotte Pudding', '21', 'Card_CharlottePudding.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kozuki Hiyori', '21', 'Card_KozukiHiyori.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Marguerite', '21', 'Card_Marguerite.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tomoko Kuroki', '84', 'Card_TomokoKuroki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuu Naruse', '84', 'Card_YuuNaruse.jpg');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rem Galleu', '85', 'Card_RemGalleu.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Setsuna', '86', 'Card_Setsuna.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rikka Takanashi', '87', 'Card_RikkaTakanashi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satone Shichimiya', '87', 'Card_SatoneShichimiya.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kumin Tsuyuri', '87', 'Card_KuminTsuyuri.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yoshino Himekawa', '22', 'Card_YoshinoHimekawa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Itsuka Kotori', '22', 'Card_ItsukaKotori.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaguya Yamai', '22', 'Card_KaguyaYamai.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yamai Kazamachi', '22', 'Card_YamaiKazamachi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tohka Yatogami', '22', 'Card_TohkaYatogami.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mei Misaki', '88', 'Card_MeiMisaki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Himeka Akishino', '89', 'Card_HimekaAkishino.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chiwa Harusaki', '89', 'Card_ChiwaHarusaki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaede Azusagawa', '60', 'Card_KaedeAzusagawa.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Onna Shinkan', '90', 'Card_OnnaShinkan.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erufu', '90', 'Card_Erufu.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shalltear Bloodfallen', '91', 'Card_ShalltearBloodfallen.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Reimi Sugimoto', '80', 'Card_ReimiSugimoto.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erina Pendleton', '80', 'Card_ErinaPendleton.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Suzie Q', '80', 'Card_SuzieQ.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elsha Lean', '92', 'Card_ElshaLean.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Atlee Ariel', '92', 'Card_AtleeAriel.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ren Sin', '92', 'Card_RenSin.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ai Ohto', '93', 'Card_AiOhto.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Holo', '94', 'Card_Holo.jpg');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuria', '95', 'Card_Yuria.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tou', '95', 'Card_Tou.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mamiya', '95', 'Card_Mamiya.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ilulu', '48', 'Card_Ilulu.jpg');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuno Gasai', '96', 'Card_YunoGasai.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Minene Uryuu', '96', 'Card_MineneUryuu.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yin', '97', 'Card_Yin.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Amber', '97', 'Card_Amber.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Misaki Kirihara', '97', 'Card_MisakiKirihara.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mumei', '98', 'Card_Mumei.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kotoko Iwanaga', '99', 'Card_KotokoIwanaga.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Saki Yumihara', '99', 'Card_SakiYumihara.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Misaki Nakahara', '100', 'Card_MisakiNakahara.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ayame Kajou', '101', 'Card_AyameKajou.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Anna Nishikinomiya', '101', 'Card_AnnaNishikinomiya.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mikoto Urabe', '102', 'Card_MikotoUrabe.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Koko Hekmatyar', '103', 'Card_KokoHekmatyar.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sakura Hibiki', '104', 'Card_SakuraHibiki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Soryuin Akemi', '104', 'Card_SoryuinAkemi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Zina Void', '104', 'Card_ZinaVoid.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Uehara Ayaka', '104', 'Card_UeharaAyaka.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akiko Yosano', '105', 'Card_AkikoYosano.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kyoko Izumi', '105', 'Card_KyokoIzumi.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Naomi Tanizaki', '105', 'Card_NaomiTanizaki.jpg');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ichiyo Higuchi', '105', 'Card_IchiyoHiguchi.jpg');",
	];
	con.connect(() => {
		con.query("DROP TABLE card", () => {
			con.query(
				"CREATE TABLE IF NOT EXISTS card ( `id` INT NOT NULL AUTO_INCREMENT , `cardName` TEXT NOT NULL , `typeID` INT NOT NULL, `cardImage` TEXT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					executeArray(sql, callback);
				}
			);
		});
	});
}

function cardTypes(callback) {
	var sql = [
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('1', 'Re:Zero');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('2', 'DARLING in the FRANXX');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('3', 'KAGUYA-SAMA: LOVE IS WAR');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('4', 'KonoSuba');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('5', 'Akame ga Kill!');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('6', 'Attack on Titan');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('7', 'Fairy Tail');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('8', 'Boku wa Tomodachi ga Sukunai');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('9', 'Neon Genesis Evangelion');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('10', 'Kakegurui');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('11', 'Bleach');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('12', 'Noragami');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('13', 'Food Wars!');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('14', 'Naruto');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('15', 'My Hero Academia');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('16', 'Heavens Lost Property');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('17', 'Sakurasou no Pet na Kanojo');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('18', 'Plastic Memories');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('19', 'Angel Beats!');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('20', 'Nisekoi');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('21', 'One Piece');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('22', 'Date a Live');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('23', 'Rosario + Vampire');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('24', 'Trinity Seven');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('25', 'Dr. Stone');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('26', 'Sword Art Online');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('27', 'Fullmetal Alchemist');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('28', 'The Testament of Sister New Devil');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('29', 'Kuroko no Basuke');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('30', 'Highschool DxD');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('31', 'Charlotte');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('32', 'The Rising Of The Shield Hero');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('33', 'Highscool of the Dead');",

		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('35', 'Dragon Ball');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('36', 'Angels of Death');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('37', 'Code Geass');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('38', 'Seven deadly sins');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('39', 'Daily Life With A Monster Girl');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('40', 'Assassination Classroom');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('41', 'Your Lie in April');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('42', 'Undefeated Bahamut Chronicle');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('43', 'Initial D');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('44', 'A Certain Scientific Railgun');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('45', 'A Certain Magical Index');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('46', 'The Asterisk War');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('47', 'Tokyo Ghoul');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('48', 'Miss Kobayashis Dragon Maid');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('49', 'Guilty Crown');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('50', 'That Time I Got Reincarnated as a Slime');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('51', 'Rent-A-Girlfriend');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('52', 'Fate');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('53', 'Death Note');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('54', 'Owari no Seraph');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('55', 'Demon Slayer');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('56', 'Violet Evergarden');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('57', 'Kuma Kuma Kuma Bear');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('58', 'Sabagebu!');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('59', 'DanMachi');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('60', 'Bunny Girl Senpai');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('61', 'Tonikaku Kawaii');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('62', 'Fire Force');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('63', 'The Irregular at Magic High School');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('64', 'Strike The Blood');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('65', 'Black Clover');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('66', 'Majo No Tabitabi');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('67', 'Uzaki-Chan Wants To Hang Out!');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('68', 'The Quintessential Quintuplets');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('69', 'Horimiya');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('70', 'Show By Rock!!');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('71', 'Monogatari Series');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('72', 'Kill la Kill');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('73', 'Promare');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('74', 'Land of the Lustrous');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('75', 'Akudama Drive');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('76', 'Hellsing Ultimate');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('77', 'Kara no Kyoukai');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('78', 'No Game No Life');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('79', 'Mushoku Tensei');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('80', 'JoJos Bizarre Adventure');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('81', 'Yuunas Haunted Hot Springs');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('82', 'The Fruit of Grisaia');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('83', 'Overlord');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('84', 'Watamote');",

		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('85', 'How Not to Summon a Demon Lord');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('86', 'Redo of Healer');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('87', 'Love, Chunibyo & Other Delusions!');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('88', 'Another');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('89', 'Oreshura');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('90', 'Goblin Slayer');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('91', 'Overlord');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('92', 'Back Arrow');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('93', 'Wonder Egg Priority');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('94', 'Spice and Wolf');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('95', 'Hokuto no Ken');",

		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('96', 'Mirai Nikki');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('97', 'Darker than Black');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('98', 'Kabaneri of the Iron Fortress');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('99', 'Kyokou Suiri');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('100', 'Welcome to the N.H.K.');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('101', 'Shimoneta');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('102', 'Mysterious Girlfriend X');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('103', 'Jormungand');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('104', 'How Heavy are the Dumbbells You Lift?');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('105', 'Bungo Stray Dogs');",
	];

	con.connect(() => {
		con.query("DROP TABLE cardtype", () => {
			con.query(
				"CREATE TABLE IF NOT EXISTS cardtype ( `id` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					executeArray(sql, callback);
				}
			);
		});
	});
}

function frames(callback) {
	var sql = [
		"INSERT INTO `frame` (`id`, `name`, `path_front` , `path_back`) VALUES ('0', 'Silver', 'Frame_Silver_Front.png', 'Frame_Silver_Back.png')",
	];

	con.connect(() => {
		con.query("DROP TABLE frame", () => {
			con.query(
				"CREATE TABLE IF NOT EXISTS frame ( `id` INT NOT NULL , `name` TEXT NOT NULL , `path_front` TEXT NOT NULL, `path_back` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					executeArray(sql, callback);
				}
			);
		});
	});
}

function effects(callback) {
	var sql = [
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('1', 'Effect1.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('2', 'Effect2.gif', '0.5')",
	];

	con.connect(() => {
		con.query("DROP TABLE effect", () => {
			con.query(
				"CREATE TABLE IF NOT EXISTS `effect` ( `id` INT NOT NULL ,`path` TEXT NOT NULL, `opacity` FLOAT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;",
				() => {
					executeArray(sql, callback);
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

function executeArray(sql, callback) {
	var count = 0;
	if (sql.length == 0) {
		callback();
		return;
	}

	for (var i = 0; i < sql.length; i++) {
		con.query(sql[i], (err) => {
			if (err) console.log(err);
			taskEnd();
		});
	}

	function taskEnd() {
		count++;
		if (count == sql.length) callback();
	}
}
