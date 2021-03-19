const config = require("./config.json");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const database = require("./database");
const cache = require("./serverCache");
const utils = require("./utils");
const logger = require("./logger");
const Client = require("./cache");

const jwtSecret = "yCSgVxmL9I";

const imageBase = "Card/";
const frameBase = "Frame/";
const effectBase = "Effect/";
const userRegex = /^[a-zA-Z0-9_]+$/;
const passRegex = /^[a-zA-Z0-9_.]+$/;

const cacheTime = 900000;
const cardCashInterval = 3600000;

const tradeCooldown = config.tradecooldown;
const packCooldown = config.packCooldown;
const logfile = config.logfile;
const packDateSendSpan = config.packDateSendSpan;
const packDateSpan = config.packDateSpan;
const tradeLimit = config.tradeLimit;
const friendLimit = config.friendLimit;
const inventorySendAmount = config.inventorySendAmount;

const qualityRange = [1, 5];
const packSize = [1, 1];
const passLen = [8, 30];
const userLen = [4, 20];
const port = config.port;

var clients = {};

function createCache(userIDV, username, callback) {
	if (!clients[userIDV]) {
		if (username == undefined) {
			database.getUserName(userIDV, (_usr) => {
				username = _usr;
				if (username == "null") {
					callback(-1);
					return;
				} else {
					run();
				}
			});
		} else {
			run();
		}
		function run() {
			clients[userIDV] = new Client(userIDV, username, callback);
			clients[userIDV].startDecay(cacheTime, clearCache);
		}
	}
}
function clearCache(userID) {
	clients[userID].save();
	delete clients[userID];
}
function setTrade(userone, usertwo, status, callback) {
	database.getTradeManager(userone, usertwo, (tm) => {
		if (tm == undefined) {
			database.addTradeManager(userone, usertwo, () => {
				run2();
			});
		} else {
			run2();
		}
		function run2() {
			database.setTradeStatus(userone, usertwo, status, () => {
				callback();
			});
		}
	});
}
function getCardRequestData(userID, uuid, next, page, sortType, callback) {
	var inventory;
	var maincard;
	var pageStats;

	if (uuid == undefined || isNaN(uuid) || uuid == null) {
		uuid = clients[userID].lastmain;
		if (uuid == undefined) {
			callback({status: 1, message: "No main uuid"});
			return;
		}
	} else {
		clients[userID].lastmain = uuid;
	}
	var maincard = clients[userID].getCard(uuid)
	if (maincard == undefined) {
		callback({
			status: 1,
			message: "Cant find card, or it isnt yours",
		});
		return;
	}
	var ids = [maincard.cardID];
	var uuids = [uuid];
	if (next == 0) {
		inventory = clients[userID].nextPage(inventorySendAmount);
	} else if (next == 1) {
		inventory = clients[userID].prevPage(inventorySendAmount);
	} else
		inventory = clients[userID].getInventory(
			page,
			inventorySendAmount,
			ids,
			uuids,
			maincard.level,
			sortType
		);
	pageStats = clients[userID].getPageStats();
	getCard(maincard.cardID, maincard.frameID, maincard.level, (_maincard) => {
		maincard.card = _maincard;
		getCards(inventory, () => {
			callback({
				status: 0,
				inventory: inventory,
				card: maincard,
				page: pageStats[0],
				pagemax: pageStats[1],
			});
		});
	});
}
function getCard(cardID, frameID, level, callback) {
	var card;
	database.getCard(cardID, (result) => {
		card = result;
		card.cardImage = imageBase + card.cardImage;
		database.getCardType(card.typeID, (result2) => {
			card.type = result2;
			database.getFrame(frameID, (frame) => {
				frame.path_front = frameBase + frame.path_front;
				frame.path_back = frameBase + frame.path_back;
				card.frame = frame;
				database.getEffect(level, (ep, eo) => {
					if (ep == null) card.effect = null;
					else card.effect = effectBase + ep;
					card.effectopacity = eo;
					callback(card);
				});
			});
		});
	});
}
function getCards(cards, callback) {
	if (cards.length == 0) {
		callback();
		return;
	}
	run(0);
	function run(iteration) {
		getCard(
			cards[iteration].cardID,
			cards[iteration].frameID,
			cards[iteration].level,
			(card) => {
				cards[iteration].card = card;
				if (iteration == cards.length - 1) {
					callback();
					return;
				} else {
					run(iteration + 1);
				}
			}
		);
	}
}
function getRandomCards(amount, callback) {
	var cards = [];
	database.getRandomCard(amount, (_cards) => {
		for (var j = 0; j < _cards.length; j++) {
			var quality = utils.getRandomInt(qualityRange[0], qualityRange[1]);
			cards[j] = {};
			cards[j].quality = quality;
			cards[j].level = 0;
			var r = utils.getRandomInt(0, 1000);
			if (r <= 50) cards[j].level = 1;
			if (r <= 5) cards[j].level = 2;
			cards[j].cardID = _cards[j].id;
			cards[j].typeID = _cards[j].typeID;
		}
		database.getRandomFrame(amount, (_frames) => {
			for (var j = 0; j < cards.length; j++) {
				cards[j].frameID = _frames[utils.getRandomInt(0, _frames.length - 1)].id;
			}
			getCards(cards, () => {
				callback(cards);
			})
		});
	});
}
function checkUser(username) {
	if (
		username == undefined ||
		username.length < userLen[0] ||
		username.length > userLen[1]
	)
		return 1;
	if (!userRegex.test(username)) return 2;
	return 0;
}
function checkPass(password) {
	if (
		password == undefined ||
		password.length < passLen[0] ||
		password.length > passLen[1]
	)
		return 1;
	if (!passRegex.test(password)) return 2;
	return 0;
}
function setFriendinventory(userone, usertwo) {
	if (userone.friendinventory != undefined && userone.friendinventory.id == usertwo.id) return;
	removeFriendinventory(userone, usertwo);
	userone.friendinventory = {id: usertwo.id, inventory: [...usertwo.inventory]};
	cache.addFriendinventorylink(usertwo.id, userone.id);
}
function removeFriendinventory(userone, usertwo) {
	if (userone.friendinventory == undefined) return;
	userone.friendinventory = undefined;
	cache.removeFriendinventorylink(usertwo.id, userone.id);
}
function addCardToUser(userID, cardID, quality, level, frameID, callback) {
	database.addCard(
		userID,
		cardID,
		quality,
		level,
		frameID,
		(insertID) => {
			addCardToUserCache(userID, insertID, cardID, quality, level, frameID);
			callback(insertID);
		});
}
function addCardToUserCache(userID, id, cardID, quality, level, frameID) {
	if (clients[userID] != undefined)
		clients[userID].addCard({
			id: id,
			cardID: cardID,
			quality: quality,
			level: level,
			frameID: frameID,
		});

	var links = cache.getFriendinventorylinks(userID);
	if (links != undefined) {
		for (var i = 0; i < links.length; i++)
			if (clients[links[i]] != undefined)
				clients[links[i]].addCardFriend({
					id: id,
					cardID: cardID,
					quality: quality,
					level: level,
					frameID: frameID,
				});
	}
}
function addCardTrade(userone, usertwo, uuid, callback) {

	if (!clients[userone].hasFriendAdded(usertwo)) {
		callback({status: 1, message: "not your friend"});
		return;
	}

	database.getTrade(userone, usertwo, (cards) => {
		if (cards.length >= tradeLimit) {
			callback({status: 1, message: "Tradelimit reached"});
			return;
		}

		database.getCardUUID(uuid, userone, (result) => {
			if (result == undefined) {
				callback({
					status: 1,
					message: "Cant find card, or it isnt yours",
				});
				return;
			}
			database.tradeExists(userone, usertwo, uuid, (b) => {
				if (b) {
					callback({status: 1, message: "Card already in trade"});
					return;
				}
				database.addTrade(userone, usertwo, uuid, () => {
					database.removeSuggestionUser(usertwo, userone, uuid, () => {
						setTrade(userone, usertwo, 0, () => {
							setTrade(usertwo, userone, 0, () => {
								callback({status: 0});
								return;
							});
						});
					});
				});
			});
		});
	});
}
function standardroutine(token, res) {
	return new Promise((resolve) => {
		try {
			var decoded = jwt.verify(token, jwtSecret);
		} catch (JsonWebTokenError) {
			res.send({status: 1, message: "Identification Please"});
			return;
		}

		if (clients[decoded.id] != undefined) {
			clients[decoded.id].refresh();
			isVerified();
		}

		createCache(decoded.id, decoded.username, (ret) => {
			if (ret == -1) {
				res.send({status: 2, message: "Cant find User"});
				return;
			}
			isVerified();
		});

		function isVerified() {
			//if(clients[i])
			resolve(decoded);
		}
	});
}
function removeTrade(carduuid, mainuuid, callback) {
	database.getTradesCard(carduuid, (ts) => {
		if (ts != undefined) {
			run2(0);
			function run2(iter) {
				if (iter == ts.length) {
					run3();
					return;
				}
				setTrade(ts[iter].userone, ts[iter].usertwo, 0, () => {
					database.addNotification(
						ts[iter].usertwo,
						"Trade Card Removed",
						"A card got removed from a trade, click to view!",
						"trade?userID=" + ts[iter].userone,
						() => {}
					);
					run2(iter + 1);
				});
			}
		} else {
			run3();
		}
		function run3() {
			database.getTradesCard(mainuuid, (ts2) => {
				if (ts2 != undefined) {
					run4(0);
					function run4(iter) {
						if (iter == ts2.length) {
							run5();
							return;
						}
						setTrade(ts2[iter].userone, ts2[iter].usertwo, 0, () => {
							database.addNotification(
								ts2[iter].usertwo,
								"Trade Card Removed",
								"A card got removed from a trade, click to view!",
								"trade?userID=" + ts2[iter].userone,
								() => {}
							);
							run4(iter + 1);
						});
					}
				} else {
					run5();
				}

				function run5() {
					database.removeTrade(mainuuid, () => {
						database.removeTrade(carduuid, () => {
							callback();
						});
					});
				}
			});
		}
	});
}
function getTradeTime(userID) {
	var nowDate = moment();
	var packDate = moment(parseInt(clients[userID].tradeTime));

	if (
		clients[userID] == undefined ||
		clients[userID].packTime == "null" ||
		nowDate.isAfter(packDate) ||
		!packDate.isValid()
	) {
		return 0;
	} else {
		return packDate.diff(nowDate).seconds();
	}
}
function getPackTime(userID) {
	var nowDate = moment();
	var packDate = moment(parseInt(clients[userID].packTime));

	if (
		clients[userID] == undefined ||
		clients[userID].packTime == "null" ||
		nowDate.isAfter(packDate) ||
		!packDate.isValid()
	) {
		return 0;
	} else {
		return packDate.diff(nowDate).seconds();
	}
}
function getPort() {
	return port;
}
function getUserLen() {
	return userLen;
}
function getPassLen() {
	return passLen;
}
function getPackSize() {
	return packSize;
}
function getQualityRange() {
	return qualityRange;
}
function getClients() {
	return clients;
}
function getInventorySendAmount() {
	return inventorySendAmount;
}
function getFriendLimit() {
	return friendLimit;
}
function getTradeLimit() {
	return tradeLimit;
}
function getPackDateSpan() {
	return packDateSpan;
}
function getPackDateSendSpan() {
	return packDateSendSpan;
}
function getLogfile() {
	return logfile;
}
function getPackCooldown() {
	return packCooldown;
}
function getTradeCooldown() {
	return tradeCooldown;
}
function getCardCacheInterval() {
	return cardCashInterval;
}
function getJWTSecret() {
	return jwtSecret;
}
module.exports =
{
	getPort: getPort,
	getUserLen: getUserLen,
	getPassLen: getPassLen,
	getPackSize: getPackSize,
	getQualityRange: getQualityRange,
	getClients: getClients,
	getInventorySendAmount: getInventorySendAmount,
	getFriendLimit: getFriendLimit,
	getTradeLimit: getTradeLimit,
	getPackDateSpan: getPackDateSpan,
	getPackDateSendSpan: getPackDateSendSpan,
	getLogfile: getLogfile,
	getPackCooldown: getPackCooldown,
	getTradeCooldown: getTradeCooldown,
	getCardCacheInterval: getCardCacheInterval,
	getJWTSecret: getJWTSecret,
	setTrade: setTrade,
	getCardRequestData: getCardRequestData,
	getCard: getCard,
	getCards: getCards,
	getRandomCards: getRandomCards,
	checkUser: checkUser,
	checkPass: checkPass,
	createCache: createCache,
	clearCache: clearCache,
	setFriendinventory: setFriendinventory,
	removeFriendinventory: removeFriendinventory,
	addCardToUser: addCardToUser,
	addCardToUserCache: addCardToUserCache,
	addCardTrade: addCardTrade,
	standardroutine: standardroutine,
	removeTrade: removeTrade,
	getTradeTime: getTradeTime,
	getPackTime: getPackTime
};
