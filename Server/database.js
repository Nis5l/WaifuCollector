const sql = require("mysql");
const bcrypt = require("bcrypt");
const async = require('async');
const moment = require("moment");

const packTime = "PACKTIME";
const tradeTime = "TRADETIME";

const config = require("./config.json");

var con = sql.createConnection({
	host: config.mysql.host,
	port: config.mysql.port,
	user: config.mysql.user,
	password: config.mysql.password,
});

const pool = sql.createPool({
	host: config.mysql.host,
	port: config.mysql.port,
	user: config.mysql.user,
	password: config.mysql.password,
	connectionLimit: 10,
	dateStrings: true,
	multipleStatements: true
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
			"CREATE TABLE IF NOT EXISTS `trademanager` ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `statusone` INT NOT NULL , `statustwo` INT NOT NULL, `cooldown` TEXT NOT NULL) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `notification` ( `id` INT NOT NULL AUTO_INCREMENT, userID INT NOT NULL, `title` TEXT NOT NULL, `message` TEXT NOT NULL, `url` TEXT NOT NULL, `time` BIGINT NOT NULL, PRIMARY KEY (`id`))",
			"CREATE TABLE IF NOT EXISTS `effect` ( `id` INT NOT NULL ,`path` TEXT NOT NULL, `opacity` FLOAT NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `packdata` ( `amount` INT NOT NULL , `time` BIGINT NOT NULL , PRIMARY KEY (`time`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `tradesuggestion` ( `userone` INT NOT NULL , `usertwo` INT NOT NULL , `card` INT NOT NULL ) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `verificationkey` ( `userID` INT NOT NULL , `key` TEXT NOT NULL , PRIMARY KEY (`userID`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `packTime` ( `userID` INT NOT NULL , `time` TEXT NOT NULL , PRIMARY KEY (`userID`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `animePackTime` ( `userID` INT NOT NULL , `time` TEXT NOT NULL , PRIMARY KEY (`userID`)) ENGINE = InnoDB;",
			"CREATE TABLE IF NOT EXISTS `animePool` ( `id` INT NOT NULL , `animeID` TEXT NOT NULL) ENGINE = InnoDB;"

			/*
			* FOR OLDER VERSIONS
			*
			* "ALTER TABLE user ADD COLUMN email TEXT NOT NULL, ADD COLUMN verified INT NOT NULL;",
			* "ALTER TABLE trademanager ADD COLUMN cooldown TEXT NOT NULL;"
			* "ALTER TABLE trademanager ADD COLUMN cooldown TEXT NOT NULL;"
			* "ALTER TABLE notification ADD COLUMN time TEXT NOT NULL;"
			*/

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

	register: function register(username, password, email, callback) {
		userexists(username, (b) => {
			if (!b) {
				bcrypt.hash(password, 10, (err, hash) => {
					con.query(
						"INSERT INTO user (username, password, ranking, email, verified) VALUES ( ?, ?, ?, ?, ?)"
						, [username, hash, 0, email, 0],
						function (err, result, fields) {

							callback(true, "registered");
						}
					);
				});
			} else {
				callback(false, "user already exists");
			}
		});
	},

	getPackTime: function getPackTime(userID, callback) {
		con.query(
			`SELECT time FROM packTime WHERE userID = ${userID};`,
			function (err, result, fields) {
				if (result == undefined || result.length == 0) {
					callback(0);
					return;
				}
				callback(result[0].time);
			}
		);
	},

	setPackTime: function setPackTime(userID, time) {
		con.query(
			`UPDATE packTime SET time = ${time} WHERE userID = ${userID};`,
			function (err, result, fields) {
				if (result == undefined || result.affectedRows == 0) {
					con.query(
						`INSERT INTO packTime (\`userID\`, \`time\`) VALUES ( ${userID}, ${time});`,
						function (err, result, fields) {}
					);
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

		if (!userID || userID == "undefined") {

			callback(null);
			return;

		}

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

				if (result) {

					callback(result.insertId);
					return;

				}

				callback(undefined);

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
	fillCard: function fillCard(card, callback) {
		//CARDS

		const query = `
SELECT
card.cardName as cardName,
card.cardImage as cardImage,
cardtype.name as animeName,
frame.name as frameName,
frame.path_front as frameFront,
frame.path_back as frameBack,
effect.path as effectPath,
effect.opacity as effectOpacity
FROM card INNER JOIN cardtype, frame, effect
WHERE
card.id=? AND
cardtype.id=? AND
frame.id=? AND
effect.id=?;
`;

		con.query(
			query, [card.card.id, card.anime.id, card.frame.id, card.level],
			(err, result, fields) => {
				if (err) console.log(err);
				if (result === undefined)
					callback({});
				else callback(result[0]);
			}
		);
	},
	getCardFast: function getCardFast(cards, callback) {
		pool.getConnection((err, connection) => {
			let queries = [];
			for (let i = 0; i < cards.length; i++) {
				queries.push(
					(callback) => {
						connection.query(
							`SELECT * FROM card WHERE id=${cards[i].cardID}`,
							(err, result, fields) => {
								cards[i].card = result;
								callback();
								//if (result != undefined) {
								//callback(result[0]);
								//} else {
								//callback(undefined);
								//}
							}
						);
					})
			}
			connection.query(`USE ${config.mysql.database}`)
			async.parallel(queries, (err, results) => {
				callback();
			});
		})
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
	getCardUUID: async function getCardUUID(uuid, userID) {

		const query = `SELECT
unlocked.id as id,
unlocked.userID as userID,
unlocked.level as level,
unlocked.quality as quality,
unlocked.frameID as frameID,
unlocked.cardID as cardID
FROM unlocked WHERE
unlocked.id=? AND
unlocked.userID=?;
`;

		return new Promise((resolve) => {
			con.query(
				query, [uuid, userID],
				(err, result) => {
					if (err) console.log(err);
					if (result == undefined || result.length == 0) return resolve(undefined);
					return resolve(result[0]);
				}
			);
		});
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
	getUsersAll: function getUsersAll(callback) {
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
	getTrade: async function getTrade(userone, usertwo) {

		const query = `SELECT
unlocked.id as id,
unlocked.userID as userID,
unlocked.level as level,
unlocked.quality as quality,
card.id as cardID,
card.cardName as cardName,
card.cardImage as cardImage,
cardtype.id as animeID,
cardtype.name as animeName,
frame.id as frameID,
frame.name as frameName,
frame.path_front as frameFront,
frame.path_back as frameBack,
effect.id as effectID,
effect.path as effectImage,
effect.opacity as effectOpacity
FROM
trade INNER JOIN unlocked, card, cardtype, frame, effect
WHERE
unlocked.cardID = card.id AND
card.typeID = cardtype.id AND
effect.id = unlocked.level AND
unlocked.id = trade.card AND
trade.userone=? AND trade.usertwo=?;
`;

		return new Promise((resolve, reject) => {
			con.query(
				query, [userone, usertwo],
				(err, result) => {
					if (err) return reject(err);
					return resolve(result);
				}
			);
		});
	},
	getTradeUUIDs: async function getTradeUUIDs(userone, usertwo) {
		const query = "SELECT trade.card as uuid FROM trade WHERE trade.userone=? AND trade.usertwo=?;"

		return new Promise((resolve, reject) => {
			con.query(query, [userone, usertwo], (err, result) => {
				if (err) return reject(err);
				return resolve(result);
			});
		});
	},
	getTradeSuggestions: async function getTradeSuggestions(userone, usertwo) {

		const query = `SELECT
unlocked.id as id,
unlocked.userID as userID,
unlocked.level as level,
unlocked.quality as quality,
card.id as cardID,
card.cardName as cardName,
card.cardImage as cardImage,
cardtype.id as animeID,
cardtype.name as animeName,
frame.id as frameID,
frame.name as frameName,
frame.path_front as frameFront,
frame.path_back as frameBack,
effect.id as effectID,
effect.path as effectImage,
effect.opacity as effectOpacity
FROM
tradesuggestion INNER JOIN unlocked, card, cardtype, frame, effect
WHERE
unlocked.cardID = card.id AND
card.typeID = cardtype.id AND
effect.id = unlocked.level AND
unlocked.id = tradesuggestion.card AND
tradesuggestion.userone=? AND tradesuggestion.usertwo=?;
`;

		return new Promise((resolve, reject) => {
			con.query(
				query, [userone, usertwo],
				(err, result) => {
					if (err) return reject(err);
					return resolve(result);
				}
			);
		});
	},
	getTradeSuggestionUUIDs: async function getTradeSuggestionUUIDs(userone, usertwo) {
		const query = "SELECT tradesuggestion.card as uuid FROM tradesuggestion WHERE tradesuggestion.userone=? AND tradesuggestion.usertwo=?;"

		return new Promise((resolve, reject) => {
			con.query(query, [userone, usertwo], (err, result) => {
				if (err) return reject(err);
				return resolve(result);
			});
		});
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
			"INSERT INTO `trademanager` (`userone`, `usertwo`, `statusone`, `statustwo`, `cooldown`) VALUES ('" +
			userone +
			"', '" +
			usertwo +
			"', '0', '0', '0')",
			function (err, result, fields) {
				callback(result);
			}
		);
	},
	getTradeManager: async function getTradeManager(userone, usertwo) {
		return new Promise((resolve) => {
			con.query(
				"SELECT * FROM trademanager WHERE (userone=? AND usertwo=?) OR (userone=? AND usertwo=?)", [userone, usertwo, usertwo, userone],
				(err, result) => {
					if (result != undefined && result.length == 0) return resolve(undefined);
					return resolve(result);
				}
			);
		});
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
			`INSERT INTO notification(userID, title, message, url, time)
SELECT '${userID}', '${title}', '${message}', '${url}', '${moment().valueOf()}'
FROM dual WHERE NOT EXISTS
(SELECT * FROM notification WHERE userID='${userID}' AND title='${title}' AND url='${url}');`,
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
		var keys = time.keys();
		for (const key of keys) {
			con.query(
				`UPDATE trademanager SET cooldown = ${time.get(key).time} WHERE userone = ${userID} and usertwo = ${key} OR userone = ${key} and usertwo = ${userID}; `,
				function (err, result, fields) {
				}
			);
		}
	},
	getTradeTime: function getTradeTime(userID, callback) {
		con.query(
			`SELECT * FROM trademanager WHERE userone = ${userID} OR usertwo = ${userID} `,
			function (err, result, fields) {
				if (result == undefined || result.length == 0) {
					callback([]);
					return;
				}
				var ret = [];
				for (var i = 0; i < result.length; i++) {
					var id = result[i].userone == userID ? result[i].usertwo : result[i].userone;
					var cooldown = result[i].cooldown != "" ? result[i].cooldown : 0;
					ret.push({id: id, cooldown: cooldown});
				}
				callback(ret);
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
			`UPDATE user SET email = "${mail}" WHERE id = ${userID} `,
			function (err, result, fields) {
				callback();
			}
		);
	},
	setVerificationKey: function setVerificationKey(userID, key, callback) {
		con.query(`DELETE FROM verificationkey WHERE userID = ${userID} `, (err, result, fields) => {
			con.query(`INSERT INTO verificationkey(\`userID\`, \`key\`) values (${userID}, "${key}")`, (err, result, fields) => {
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
	},
	getAnimePackTime: function getAnimePackTime(userID, callback) {
		con.query(
			`SELECT time FROM animePackTime WHERE userID = ${userID};`,
			function (err, result, fields) {
				if (result == undefined || result.length == 0) {
					callback(0);
					return;
				}
				callback(result[0].time);
			}
		);
	},
	setAnimePackTime: function setAnimePackTime(userID, time) {
		con.query(
			`UPDATE animePackTime SET time = ${time} WHERE userID = ${userID};`,
			function (err, result, fields) {
				if (result == undefined || result.affectedRows == 0) {
					con.query(
						`INSERT INTO animePackTime (\`userID\`, \`time\`) VALUES ( ${userID}, ${time});`,
						function (err, result, fields) {}
					);
				}
			}
		);
	},
	getUsers: function getUsers(username, count, offset, callback) {
		con.query(
			"SELECT id, username FROM `user` WHERE LOWER(username) LIKE LOWER(CONCAT('%',?,'%')) LIMIT ? OFFSET ?;",
			[username, count, offset],
			(err, result, fields) => {
				callback(result);
			});
	},


	/*sortType*/
	/*1: level */
	/*3: recent */
	/*!: name */
	inventory: async function inventory(userID, name, count, offset, sortType, level, cardID, excludeuuids) {

		name = `%${name}%`;

		let sortquery = `
card.cardName,
cardtype.name,
unlocked.level DESC,
unlocked.quality DESC`;

		switch (sortType) {
			case 1:
				sortquery = `
unlocked.level DESC,
unlocked.quality DESC,
card.cardName,
cardtype.name
`;
				break;
			case 2:
				sortquery = `
unlocked.id DESC
				`;
		}

		let extraConditions = "";

		if (level !== undefined)
			extraConditions += `unlocked.level = ${level} AND\n`;

		if (cardID !== undefined)
			extraConditions += `card.id = ${cardID} AND\n`;

		if (excludeuuids !== undefined) {
			let set = 0;
			for (let i = 0; i < excludeuuids.length; i++) {
				set += excludeuuids[i];
				if (i != excludeuuids.length - 1) set += ","
			}
			extraConditions += `unlocked.id NOT IN (${set}) AND \n`;
		}

		let query =
			`SELECT
unlocked.id as id,
unlocked.userID as userID,
unlocked.level as level,
unlocked.quality as quality,
card.id as cardID,
card.cardName as cardName,
card.cardImage as cardImage,
cardtype.id as animeID,
cardtype.name as animeName,
frame.id as frameID,
frame.name as frameName,
frame.path_front as frameFront,
frame.path_back as frameBack,
effect.id as effectID,
effect.path as effectImage,
effect.opacity as effectOpacity
FROM
unlocked INNER JOIN card, cardtype, frame, effect
WHERE
unlocked.cardID = card.id AND
card.typeID = cardtype.id AND
effect.id = unlocked.level AND
unlocked.userID = ? AND
${extraConditions}
(card.cardName LIKE(?) OR cardtype.name LIKE(?))
ORDER BY
${sortquery}
LIMIT ? OFFSET ?;`;

		return new Promise((resolve, reject) => {
			con.query(
				query, [userID, name, name, count, offset], (err, result) => {
					if (err) return reject(err);
					return resolve(result);
				})
		});
	},

	getCards: async function getCards(uuids) {
		let set = "";
		for (let i = 0; i < uuids.length; i++) {
			set += uuids[i];
			if (i != uuids.length - 1) set += ", ";
		}

		const query = `
SELECT
unlocked.id as id,
unlocked.userID as userID,
unlocked.level as level,
unlocked.quality as quality,
card.id as cardID,
card.cardName as cardName,
card.cardImage as cardImage,
cardtype.id as animeID,
cardtype.name as animeName,
frame.id as frameID,
frame.name as frameName,
frame.path_front as frameFront,
frame.path_back as frameBack,
effect.id as effectID,
effect.path as effectImage,
effect.opacity as effectOpacity
FROM unlocked INNER JOIN card, cardtype, frame, effect
WHERE
unlocked.cardID = card.id AND
card.typeID = cardtype.id AND
effect.id = unlocked.level AND
unlocked.id IN(${set})`;
		return new Promise((resolve, reject) => {
			con.query(query, [uuids], (err, result) => {
				if (err) return reject(err);
				return resolve(result);
			})
		});
	},
	getCardAmount: function getCardAmount() {
		const query = "SELECT COUNT(*) as count FROM card";

		return new Promise((resolve) => {
			con.query(query, (err, result) => {
				return resolve(result[0]['count']);
			})
		})
	}
};

function cards(callback) {
	//maybe:
	//Tatsuki Arisawa
	//juvia - fairy tale
	var sql = [
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rem', '1', 'Card_Rem.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'ZeroTwo', '2', 'Card_ZeroTwo.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chika', '3', 'Card_Chika.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Megumin', '4', 'Card_Megumin.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akame', '5', 'Card_Akame.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Annie Leonhardt', '6', 'Card_AnnieLeonhardt.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lucy Heartfilia', '7', 'Card_LucyHeartfilia.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ram', '1', 'Card_Ram.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kashiwazaki Sena', '8', 'Card_KashiwazakiSena.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ayanami Rei', '9', 'Card_AyanamiRei.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mary Saotome', '10', 'Card_MarySaotome.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rukia Kuchiki', '11', 'Card_RukiaKuchiki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Bishamonten', '12', 'Card_Bishamonten.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikumi Mito', '13', 'Card_IkumiMito.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ino Yamanaka', '14', 'Card_InoYamanaka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chelsea', '5', 'Card_Chelsea.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Emilia', '1', 'Card_Emilia.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Esdeath', '5', 'Card_Esdeath.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Himiko Toga', '15', 'Card_HimikoToga.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jirou Kyouka', '15', 'Card_JirouKyouka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikaros', '16', 'Card_Ikaros.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiina Mashiro', '17', 'Card_ShiinaMashiro.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Isla', '18', 'Card_Isla.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanade Tachibana', '19', 'Card_KanadeTachibana.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirisaki Chitoge', '20', 'Card_KirisakiChitoge.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miss Valentine', '21', 'Card_MissValentine.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurome', '5', 'Card_Kurome.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumi Tokisaki', '22', 'Card_KurumiTokisaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mizore', '23', 'Card_Mizore.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nami', '21', 'Card_Nami.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lieselotte Sherlock', '24', 'Card_LieselotteSherlock.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ruri', '25', 'Card_Ruri.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirigaya Suguha', '26', 'Card_KirigayaSuguha.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lan Fan', '27', 'Card_LanFan.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Leone', '5', 'Card_Leone.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mio Naruse', '28', 'Card_MioNaruse.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satsuki Momoi', '29', 'Card_SatsukiMomoi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Koneko Toujou', '30', 'Card_KonekoToujou.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erza Scarlet', '7', 'Card_ErzaScarlet.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nao Tomori', '31', 'Card_NaoTomori.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Xenovia', '30', 'Card_Xenovia.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Raphtalia', '32', 'Card_Raphtalia.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rei Miyamoto', '33', 'Card_ReiMiyamoto.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rindo Kobayashi', '13', 'Card_RindoKobayashi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erina Nakiri', '13', 'Card_ErinaNakiri.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nakiri Alice', '13', 'Card_NakiriAlice.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Temari', '14', 'Card_Temari.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsunade', '14', 'Card_Tsunade.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jabami Yumeko', '10', 'Card_JabamiYumeko.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kirai Momobami', '10', 'Card_KiraiMomobami.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Alice Zuberg', '26', 'Card_AliceZuberg.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C18', '35', 'Card_C18.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Astil Manuscript', '24', 'Card_AstilManuscript.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachel Gardner', '36', 'Card_RachelGardner.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Camie Utsumishi', '15', 'Card_CamieUtsumishi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'C C', '37', 'Card_CC.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Darkness', '4', 'Card_Darkness.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elaine', '38', 'Card_Elaine.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Papi', '39', 'Card_Papi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rachnera Arachnera', '39', 'Card_RachneraArachnera.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asia Argento', '30', 'Card_AsiaArgento.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Irina Jelavic', '40', 'Card_IrinaJelavic.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Boa Hancock', '21', 'Card_BoaHancock.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Historia Reiss', '6', 'Card_HistoriaReiss.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hanabi Hyuga', '14', 'Card_HanabiHyuga.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaori Miyazono', '41', 'Card_KaoriMiyazono.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kurumu Kurono', '23', 'Card_KurumuKurono.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisesharte Atismata', '42', 'Card_LisesharteAtismata.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Moka Akashiya', '23', 'Card_MokaAkashiya.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ririka Momobami', '10', 'Card_RirikaMomobami.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Natsuki Mogi', '43', 'Card_NatsukiMogi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mikasa Ackermann', '6', 'Card_MikasaAckermann.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Aqua', '4', 'Card_Aqua.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shokuhou Misaki', '44', 'Card_ShokuhouMisaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mikoto Misaka', '44', 'Card_MikotoMisaka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanzaki Kaori', '45', 'Card_KanzakiKaori.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Julis Riessfeld', '46', 'Card_JulisRiessfeld.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mine', '5', 'Card_Mine.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Toudou Kirin', '46', 'Card_ToudouKirin.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Claudia Enfield', '46', 'Card_ClaudiaEnfield.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sasamiya Saya', '46', 'Card_SasamiyaSaya.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Toka Kirishima', '47', 'Card_TokaKirishima.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tohru', '48', 'Card_Tohru.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanna Kamui', '48', 'Card_KannaKamui.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lucoa', '48', 'Card_Lucoa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elma', '48', 'Card_Elma.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ichigo', '2', 'Card_Ichigo.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Runa Yomozuki', '10', 'Card_RunaYomozuki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuriko Nishinotouin', '10', 'Card_YurikoNishinotouin.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yumemite Yumemi', '10', 'Card_YumemiteYumemi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shizue Izawa', '50', 'Card_ShizueIzawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rias Gremory', '30', 'Card_RiasGremory.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hinata Hyuga', '14', 'Card_HinataHyuga.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asuna Yuuki', '26', 'Card_AsunaYuuki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chizuru Mizuhara', '51', 'Card_ChizuruMizuhara.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ruka Sarashina', '51', 'Card_RukaSarashina.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mami Nanami', '51', 'Card_MamiNanami.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sumi Sakurasawa', '51', 'Card_SumiSakurasawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rin Tohsaka', '52', 'Card_RinTohsaka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Misa Amane', '53', 'Card_MisaAmane.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shinoa Hiragi', '54', 'Card_ShinoaHiragi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nezuko Kamado', '55', 'Card_NezukoKamado.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Saber', '52', 'Card_ArtoriaPendragon.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Violet Evergarden', '56', 'Card_VioletEvergarden.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuna', '57', 'Card_Yuna.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Momoka Sonokawa', '58', 'Card_MomokaSonokawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miou Ootori', '58', 'Card_MiouOotori.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Maya Kyodo', '58', 'Card_MayaKyodo.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Urara Kasugano', '58', 'Card_UraraKasugano.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yui', '19', 'Card_Yui.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuri Nakamura', '19', 'Card_YuriNakamura.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Eri Shiina', '19', 'Card_EriShiina.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hestia', '59', 'Card_Hestia.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yamato Mikoto', '59', 'Card_YamatoMikoto.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sanjouno Haruhime', '59', 'Card_SanjounoHaruhime.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ais Wallenstein', '59', 'Card_AisWallenstein.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Syr Flova', '59', 'Card_SyrFlova.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ryuu Lion', '59', 'Card_RyuuLion.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Eina Tulle', '59', 'Card_EinaTulle.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaguya Shinomiya', '3', 'Card_KaguyaShinomiya.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mai Sakurajima', '60', 'Card_MaiSakurajima.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaname Arisugawa', '61', 'Card_KanameArisugawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Aya Arisugawa', '61', 'Card_AyaArisugawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsukasa Tsukuyomi', '61', 'Card_TsukasaTsukuyomi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Maki Oze', '62', 'Card_MakiOze.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Noel Niihashi', '11', 'Card_NoelNiihashi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiba Miyuki', '63', 'Card_ShibaMiyuki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sayaka Kirasaka', '64', 'Card_SayakaKirasaka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Venessa Anoteca', '65', 'Card_VenessaAnoteca.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elaina', '66', 'Card_Elaina.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Echidna', '1', 'Card_Echidna.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Noelle Silva', '65', 'Card_NoelleSilva.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Charlotte Roselei', '65', 'Card_CharlotteRoselei.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nero', '65', 'Card_Nero.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mimosa Vermillion', '65', 'Card_MimosaVermillion.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hana Uzaki', '67', 'Card_HanaUzaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ichika Nakano', '68', 'Card_IchikaNakano.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nino Nakano', '68', 'Card_NinoNakano.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miku Nakano', '68', 'Card_MikuNakano.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yotsuba Nakano', '68', 'Card_YotsubaNakano.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Itsuki Nakano', '68', 'Card_ItsukiNakano.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hori Kyouko', '69', 'Card_HoriKyouko.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Cyan', '70', 'Card_Cyan.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kohaku', '25', 'Card_Kohaku.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shinobu Oshino', '71', 'Card_ShinobuOshino.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Suruga Kanbaru', '71', 'Card_SurugaKanbaru.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsubasa Hanekawa', '71', 'Card_TsubasaHanekawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ougi Oshino', '71', 'Card_OugiOshino.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Izuko Gaen', '71', 'Card_IzukoGaen.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ryuko Matoi', '72', 'Card_RyukoMatoi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satsuki Kiryuin', '72', 'Card_SatsukiKiryuin.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nui Harime', '72', 'Card_NuiHarime.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mako Mankanshoku', '72', 'Card_MakoMankanshoku.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nonon Jakuzure', '72', 'Card_NononJakuzure.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kokoro', '2', 'Card_Kokoro.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miku', '2', 'Card_Miku.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ikuno', '2', 'Card_Ikuno.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, '001', '2', 'Card_001.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Aina Ardebit', '73', 'Card_AinaArdebit.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Phosphophyllite', '74', 'Card_Phosphophyllite.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Cinnabar', '74', 'Card_Cinnabar.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Diamond', '74', 'Card_Diamond.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Swindler', '75', 'Card_Swindler.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Seras Victoria', '76', 'Card_SerasVictoria.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shiki Ryougi', '77', 'Card_ShikiRyougi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Asuka Langley Sohryu', '9', 'Card_AsukaLangleySohryu.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Misato Katsuragi', '9', 'Card_MisatoKatsuragi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Stephanie Dola', '78', 'Card_StephanieDola.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Jibril', '78', 'Card_Jibril.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ochako Uraraka', '15', 'Card_OchakoUraraka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tsuyu Asui', '15', 'Card_TsuyuAsui.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Momo Yaoyorozu', '15', 'Card_MomoYaoyorozu.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nejire Hado', '15', 'Card_NejireHado.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mei Hatsume', '15', 'Card_MeiHatsume.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Roxy Migurdia', '79', 'Card_RoxyMigurdia.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Eris Boreas Greyrat', '79', 'Card_ErisBoreasGreyrat.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ghislaine Dedoldia', '79', 'Card_GhislaineDedoldia.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sylphiette', '79', 'Card_Sylphiette.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Robert E O Speedwagon', '80', 'Card_RobertEOSpeedwagon.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sakura Matou', '52', 'Card_SakuraMatou.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuuna Yunohana', '81', 'Card_YuunaYunohana.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Amane Suou', '82', 'Card_AmaneSuou.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yumiko Sakaki', '82', 'Card_YumikoSakaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Michiru Matsushima', '82', 'Card_MichiruMatsushima.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sachi Komine', '82', 'Card_SachiKomine.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Makina Irisu', '82', 'Card_MakinaIrisu.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kazuki Kazami', '82', 'Card_KazukiKazami.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akeno Himejima', '30', 'Card_AkenoHimejima.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ravel Phoenix', '30', 'Card_RavelPhoenix.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Albedo', '83', 'Card_Albedo.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisa Lisa', '80', 'Card_LisaLisa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Trish Una', '80', 'Card_TrishUna.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yukako Yamagishi', '80', 'Card_YukakoYamagishi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yoruichi Shihoin', '11', 'Card_YoruichiShihoin.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nemu Kurotsuchi', '11', 'Card_NemuKurotsuchi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sode no Shirayuki', '11', 'Card_SodenoShirayuki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nelliel Tu Odelschwanck', '11', 'Card_NellielTuOdelschwanck.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tier Harribel', '11', 'Card_TierHarribel.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Cyan Sung-Sun', '11', 'Card_CyanSung-Sun.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lisa Yadomaru', '11', 'Card_LisaYadomaru.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hiyori Sarugaki', '11', 'Card_HiyoriSarugaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Charmy Pappitson', '65', 'Card_CharmyPappitson.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Vanica Zogratis', '65', 'Card_VanicaZogratis.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Fana', '65', 'Card_Fana.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sister Lily', '65', 'Card_SisterLily.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Dorothy Unsworth', '65', 'Card_DorothyUnsworth.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sol Marron', '65', 'Card_SolMarron.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nico Robin', '21', 'Card_NicoRobin.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shirahoshi', '21', 'Card_Shirahoshi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nefeltari Vivi', '21', 'Card_NefeltariVivi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Carrot', '21', 'Card_Carrot.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Charlotte Pudding', '21', 'Card_CharlottePudding.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kozuki Hiyori', '21', 'Card_KozukiHiyori.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Marguerite', '21', 'Card_Marguerite.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tomoko Kuroki', '84', 'Card_TomokoKuroki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuu Naruse', '84', 'Card_YuuNaruse.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rem Galleu', '85', 'Card_RemGalleu.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Setsuna', '86', 'Card_Setsuna.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rikka Takanashi', '87', 'Card_RikkaTakanashi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satone Shichimiya', '87', 'Card_SatoneShichimiya.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kumin Tsuyuri', '87', 'Card_KuminTsuyuri.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yoshino Himekawa', '22', 'Card_YoshinoHimekawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Itsuka Kotori', '22', 'Card_ItsukaKotori.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaguya Yamai', '22', 'Card_KaguyaYamai.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yamai Kazamachi', '22', 'Card_YamaiKazamachi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tohka Yatogami', '22', 'Card_TohkaYatogami.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mei Misaki', '88', 'Card_MeiMisaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Himeka Akishino', '89', 'Card_HimekaAkishino.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chiwa Harusaki', '89', 'Card_ChiwaHarusaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kaede Azusagawa', '60', 'Card_KaedeAzusagawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Onna Shinkan', '90', 'Card_OnnaShinkan.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erufu', '90', 'Card_Erufu.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shalltear Bloodfallen', '83', 'Card_ShalltearBloodfallen.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Reimi Sugimoto', '80', 'Card_ReimiSugimoto.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Erina Pendleton', '80', 'Card_ErinaPendleton.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Suzie Q', '80', 'Card_SuzieQ.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Elsha Lean', '92', 'Card_ElshaLean.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Atlee Ariel', '92', 'Card_AtleeAriel.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ren Sin', '92', 'Card_RenSin.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ai Ohto', '93', 'Card_AiOhto.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Holo', '94', 'Card_Holo.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuria', '95', 'Card_Yuria.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tou', '95', 'Card_Tou.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mamiya', '95', 'Card_Mamiya.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ilulu', '48', 'Card_Ilulu.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuno Gasai', '96', 'Card_YunoGasai.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Minene Uryuu', '96', 'Card_MineneUryuu.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yin', '97', 'Card_Yin.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Amber', '97', 'Card_Amber.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Misaki Kirihara', '97', 'Card_MisakiKirihara.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mumei', '98', 'Card_Mumei.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kotoko Iwanaga', '99', 'Card_KotokoIwanaga.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Saki Yumihara', '99', 'Card_SakiYumihara.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Misaki Nakahara', '100', 'Card_MisakiNakahara.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ayame Kajou', '101', 'Card_AyameKajou.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Anna Nishikinomiya', '101', 'Card_AnnaNishikinomiya.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mikoto Urabe', '102', 'Card_MikotoUrabe.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Koko Hekmatyar', '103', 'Card_KokoHekmatyar.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sakura Hibiki', '104', 'Card_SakuraHibiki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Soryuin Akemi', '104', 'Card_SoryuinAkemi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Zina Void', '104', 'Card_ZinaVoid.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Uehara Ayaka', '104', 'Card_UeharaAyaka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akiko Yosano', '105', 'Card_AkikoYosano.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kyoko Izumi', '105', 'Card_KyokoIzumi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Naomi Tanizaki', '105', 'Card_NaomiTanizaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ichiyo Higuchi', '105', 'Card_IchiyoHiguchi.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Clementine', '83', 'Card_Clementine.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Special Week', '91', 'Card_SpecialWeek.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Vodka', '91', 'Card_Vodka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Silence Suzuka', '91', 'Card_SilenceSuzuka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Tokai Teio', '91', 'Card_TokaiTeio.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Gold Ship', '91', 'Card_GoldShip.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Daiwa Scarlet', '91', 'Card_DaiwaScarlet.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ohana Matsumae', '106', 'Card_OhanaMatsumae.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Black Rabbit', '107', 'Card_BlackRabbit.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Honey', '108', 'Card_Honey.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rena Ryuuguu', '109', 'Card_RenaRyuuguu.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mion Sonozaki', '109', 'Card_MionSonozaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shion Sonozaki', '109', 'Card_ShionSonozaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Satoko Houjou', '109', 'Card_SatokoHoujou.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rika Furude', '109', 'Card_RikaFurude.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Inori Yuzuriha', '49', 'Card_InoriYuzuriha.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Nashetania Loei Piena Augustra', '110', 'Card_NashetaniaLoeiPienaAugustra.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Flamie Speeddraw', '110', 'Card_FlamieSpeeddraw.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Maple', '111', 'Card_Maple.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Fubuki Sakuragasaki', '112', 'Card_FubukiSakuragasaki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Chtholly Nota Seniorious', '113', 'Card_ChthollyNotaSeniorious.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Clare', '114', 'Card_Clare.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yoko Littner', '115', 'Card_YokoLittner.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yue', '116', 'Card_Yue.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shea Haulia', '116', 'Card_SheaHaulia.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Faye Valentine', '117', 'Card_FayeValentine.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Judy', '117', 'Card_Judy.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ristarte', '118', 'Card_Ristarte.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Perona', '21', 'Card_Perona.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Lain', '119', 'Card_Lain.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rea Sanka', '120', 'Card_ReaSanka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Sempai', '121', 'Card_Sempai.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Saki', '121', 'Card_Saki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Madara', '121', 'Card_Madara.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Bluma', '35', 'Card_Bluma.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Winry Rockbell', '27', 'Card_WinryRockbell.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Olivier Mira Armstrong', '27', 'Card_OlivierMiraArmstrong.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Izumi Curtis', '27', 'Card_IzumiCurtis.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Riza Hawkeye', '27', 'Card_RizaHawkeye.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuzu Aihara', '122', 'Card_YuzuAihara.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mei Aihara', '122', 'Card_MeiAihara.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rui Tachibana', '123', 'Card_RuiTachibana.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hina Tachibana', '123', 'Card_HinaTachibana.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Narberal Gamma', '83', 'Card_NarberalGamma.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Solution Epsilon', '83', 'Card_SolutionEpsilon.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Milim Nava', '50', 'Card_MilimNava.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shuna', '50', 'Card_Shuna.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shion', '50', 'Card_Shion.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Motoko Kusanagi', '124', 'Card_MotokoKusanagi.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Suzune Horikita', '126', 'Card_SuzuneHorikita.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kikyo Kushida', '126', 'Card_KikyoKushida.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Honami Ichinose', '126', 'Card_HonamiIchinose.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kei Karuizawa', '126', 'Card_KeiKaruizawa.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mamimi Samejima', '127', 'Card_MamimiSamejima.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Haruko Haruhara', '127', 'Card_HarukoHaruhara.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hidomi Hibajiri', '127', 'Card_HidomiHibajiri.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kana Koumoto', '127', 'Card_KanaKoumoto.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Julia Jinyu', '127', 'Card_JuliaJinyu.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hinae Hibajiri', '127', 'Card_HinaeHibajiri.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuria Harudera', '82', 'Card_YuriaHarudera.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ai Hayasaka', '3', 'Card_AiHayasaka.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Miko Iino', '3', 'Card_MikoIino.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mugino Shizuri', '44', 'Card_MuginoShizuri.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Hitagi Senjougahara', '71', 'Card_HitagiSenjougahara.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Akatsuki', '128', 'Card_Akatsuki.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Henrietta', '128', 'Card_Henrietta.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Marielle', '128', 'Card_Marielle.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Fine Forte', '92', 'Card_FineForte.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Prax Conrad', '92', 'Card_PraxConrad.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shouko Nishimiya', '129', 'Card_ShoukoNishimiya.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Yuzuru Nishimiya', '129', 'Card_YuzuruNishimiya.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Naoka Ueno', '129', 'Card_NaokaUeno.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Rei Hino', '125', 'Card_ReiHino.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Makoto Kino', '125', 'Card_MakotoKino.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Usagi Tsukino', '125', 'Card_UsagiTsukino.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Ami Mizuno', '125', 'Card_AmiMizuno.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Minako Aino', '125', 'Card_MinakoAino.webp');",

		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Shinobu Kochou', '55', 'Card_ShinobuKochou.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Kanao Tsuyuri', '55', 'Card_KanaoTsuyuri.webp');",
		"INSERT INTO `card` (`id`, `cardName`, `typeID`, `cardImage`) VALUES (NULL, 'Mitsuri Kanroji', '55', 'Card_MitsuriKanroji.webp');",
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

		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('91', 'Uma Musume');",

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

		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('106', 'Hanasaku Iroha');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('107', 'Problem Children are Coming from Another World Arent They?');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('108', 'Space Dandy');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('109', 'Higurashi');",

		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('110', 'Rokka: Braves of the Six Flowers');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('111', 'Bofuri');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('112', 'Arcade Gamer Fubuki');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('113', 'WorldEnd');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('114', 'Claymore');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('115', 'Tenga Toppa Gurren Lagann');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('116', 'Arifureta');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('117', 'Cowboy Bebop');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('118', 'Cautious Hero');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('119', 'Serial Experiments Lain');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('120', 'Sankarea');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('121', 'Magical Sempai');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('122', 'Citrus');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('123', 'Domestic Girlfriend');",

		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('124', 'Ghost in the Shell');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('125', 'Sailor Moon');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('126', 'Classroom of the Elite');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('127', 'Fooly Cooly');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('128', 'Log Horizon');",
		"INSERT INTO `cardtype` (`id`, `name`) VALUES ('129', 'A Silent Voice');",
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
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('0', '', '0')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('1', 'Effect1.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('2', 'Effect2.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('3', 'Effect2.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('4', 'Effect2.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('5', 'Effect2.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('6', 'Effect2.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('7', 'Effect2.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('8', 'Effect2.gif', '0.5')",
		"INSERT INTO `effect` (`id`, `path`, `opacity`) VALUES ('9', 'Effect2.gif', '0.5')"
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
