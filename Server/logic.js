const config = require("./config.json");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const database = require("./database");
const cache = require("./serverCache");
const utils = require("./utils");
const logger = require("./logger");
const Client = require("./cache");
const crypto = require('crypto');
const mail = require('./mail');
const {reject} = require("async");

const jwtSecret = "yCSgVxmL9I";

const cardBase = "Card/";
const frameBase = "Frame/";
const effectBase = "Effect/";
const userRegex = /^[a-zA-Z0-9_]+$/;
const passRegex = /^[a-zA-Z0-9_.]+$/;
const mailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const cacheTime = 900000;
//const cacheTime = 3000;
const cardCashInterval = 3600000;

const tradeCooldown = config.tradecooldown;
const packCooldown = config.packCooldown;
const logfile = config.logfile;
const packDateSendSpan = config.packDateSendSpan;
const packDateSpan = config.packDateSpan;
const tradeLimit = config.tradeLimit;
const friendLimit = config.friendLimit;
const inventorySendAmount = config.inventorySendAmount;
const tradeCooldownMax = config.tradeCooldownLimit;
const animePackCooldown = config.animePackCooldown;

const qualityRange = [1, 5];
const packSize = [1, 1];
const animePackSize = [1, 1];
const passLen = [8, 30];
const userLen = [4, 20];
const port = config.port;

var clients = {};

const devs = [
	"SmallCode",
	"Nissl"
];

function createCache(userID, username, res) {
	return new Promise((resolve, reject) => {
		if (clients[userID]) {
			clients[userID].refresh();
			resolve(userID);
		}

		if (username == undefined) {
			database.getUserName(userID, (_usr) => {
				username = _usr;
				if (username == null) {
					res.send({status: 1, message: "User not found"});
					return reject(new Error("EarlyExit"));
				} else {
					run();
				}
			});
		} else {
			run();
		}

		function run() {
			database.getMailVerified(userID, (mv) => {
				var client = new Client(userID, username, mv.email, mv.verified, () => {
					if (!clients[userID]) {
						client.startDecay(cacheTime, clearCache);
						clients[userID] = client;
					}
					resolve(userID);
				});
			});
		}
	});
}
function clearCache(userID) {
	if (clients[userID]) {
		clients[userID].save();
		delete clients[userID];
	}
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

async function getCard(uuid) {
	let result = await database.getCards([uuid]);
	if (result.length === 0) return undefined;
	card = result[0];
	formatCard(card);
	return card;
}

async function getCards(uuids) {
	let cards = await database.getCards(uuids);
	formatCards(cards);
	return cards;
}

function fillCard(card, callback) {
	database.fillCard(card, (result) => {
		card.card.name = result.cardName;
		card.card.image = cardBase + result.cardImage;
		card.anime.name = result.animeName;
		card.frame.name = result.frameName;
		card.frame.front = frameBase + result.frameFront;
		card.frame.back = frameBase + result.frameBack;
		card.effect = {};
		card.effect.image = effectBase + result.effectPath;
		card.effect.opacity = result.effectOpacity;
		callback(card);
	});
}

function fillCards(cards, callback) {
	if (cards.length == 0) {
		callback();
		return;
	}

	let count = 0;

	for (let i = 0; i < cards.length; i++) {
		fillCard(
			cards[i],
			() => {
				onfinish();
			}
		);
	}

	function onfinish() {
		count++;
		if (count == cards.length) callback();
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
			cards[j].card = {};
			cards[j].card.id = _cards[j].id;
			cards[j].anime = {};
			cards[j].anime.id = _cards[j].typeID;
		}
		database.getRandomFrame(amount, (_frames) => {
			for (var j = 0; j < cards.length; j++) {
				cards[j].frame = {};
				cards[j].frame.id = _frames[utils.getRandomInt(0, _frames.length - 1)].id;
			}
			fillCards(cards, () => {
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
function addCardToUser(userID, card, callback) {
	database.addCard(
		userID,
		card.card.id,
		card.quality,
		card.level,
		card.frame.id,
		(insertID) => {
			addCardToUserCache(userID, insertID, card.card.id, card.quality, card.level, card.frame.id);
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

function removeCardFromUserCache(userID, id) {
	if (clients[userID] != undefined)
		clients[userID].deleteCard(id);

	var links = cache.getFriendinventorylinks(userID);
	if (links != undefined) {
		for (var i = 0; i < links.length; i++)
			if (clients[links[i]] != undefined)
				clients[links[i]].deleteCardFriend(id);
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
	return new Promise(
		async (resolve, reject) => {
			try {
				var decoded = jwt.verify(token, jwtSecret);
			} catch (JsonWebTokenError) {
				res.send({status: 1, message: "Identification Please"});
				return reject(new Error("EarlyExit"));
			}

			if (clients[decoded.id] != undefined) {
				clients[decoded.id].refresh();
				isVerified();
			}

			await createCache(decoded.id, decoded.username, res);

			try {
				isVerified();
			} catch (ex) {
				return reject(ex);
			}

			function isVerified() {
				if (clients[decoded.id].verified == 1) return resolve(decoded);

				if (clients[decoded.id].mail.length == 0) {
					res.send({status: 11, message: "Account needs to be verified"});
					return reject(new Error("EarlyExit"));
				}

				res.send({status: 10, message: "Account needs to be verified"});
				return reject(new Error("EarlyExit"));
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
							database.removeSuggestion(mainuuid, () => {
								database.removeSuggestion(carduuid, () => {
									callback();
								});
							});
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
function sendVerification(userID, email, callback) {
	var key = crypto.randomBytes(20).toString('hex');
	database.setVerificationKey(userID, key, () => {
		mail.send(email, key);
		callback();
	});
}
function checkMail(mail) {
	return mailRegex.test(mail);
}
function handleException(ex, res) {
	if (ex.message == "EarlyExit") return;
	console.log(ex);
	logger.write(ex);
	res.send({status: 1, message: "Internal error"});
}
function verifyMail(userID, key, res) {
	database.getVerificationKey(userID, (_key) => {
		if (_key == null) {
			res.send({status: 2, message: "no key"});
			return;
		}
		if (_key == key) {
			database.setVerified(userID, 1, () => {
				if (clients[userID]) clients[userID].verified = 1;
				res.send({status: 0});
			});
			return;
		}
		res.send({status: 1, message: "keys dont match"});
	});
}
function getAnimePackTime(userID) {
	var nowDate = moment();
	var packDate = moment(parseInt(clients[userID].animePackTime));

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

function getBadges(username) {
	if (devs.indexOf(username) === -1) return [];

	const badges = [
		{
			name: "Developer",
			asset: "http://localhost:3000/assets/badges/dev.jpg"
		}
	]

	return badges;
}

function sendFriendReqeust(userone, usertwo, res) {
	if (usertwo == undefined) {
		res.send({status: 1, message: "cant find user"});
		return;
	}
	if (usertwo == userone) {
		res.send({status: 1, message: "cant add yourself"});
		return;
	}
	if (getClients()[userone].hasFriend(usertwo)) {
		res.send({status: 1, message: "already added"});
		return;
	}
	if (getClients()[userone].getFriends().length == getFriendLimit()) {
		res.send({status: 1, message: "reached max friend count"});
		return;
	}
	if (getClients()[usertwo] != undefined) {
		if (getClients()[usertwo].hasFriend(userone)) {
			res.send({status: 1, message: "already sent"});
			return;
		}
		run2();
	} else {
		database.isFriendPending(userone, usertwo, (b) => {
			if (b) {
				res.send({status: 1, message: "already sent"});
				return;
			}
			run2();
		});
	}
	function run2() {
		getClients()[userone].addFriendRequest(usertwo);
		if (getClients()[usertwo] != undefined)
			getClients()[usertwo].addFriendRequestIncoming(userone);
		database.addFriendRequest(userone, usertwo, () => {
			database.addNotification(
				usertwo,
				"Friend Request",
				"You got a new friend request, click to view!",
				"friends",
				() => {}
			);
			res.send({status: 0});
			return;
		});
	}
}

async function inventory(userID, name, count, offset, sortType, level, cardID, excludeuuids) {

	if (count < 0) count = inventorySendAmount;

	offset *= count;

	let cards = await database.inventory(userID, name, count, offset, sortType, level, cardID, excludeuuids)
	formatCards(cards);
	return new Promise((resolve) => {return resolve(cards)});
}

function formatCards(cards) {
	for (let i = 0; i < cards.length; i++)
		formatCard(cards[i]);
}

function formatCard(card) {
	card.card = {};
	card.card.id = card.cardID;
	card.card.name = card.cardName;
	card.card.image = cardBase + card.cardImage;
	delete card.cardID;
	delete card.cardName;
	delete card.cardImage;

	card.frame = {};
	card.frame.id = card.frameID;
	card.frame.name = card.frameName;
	card.frame.front = frameBase + card.frameFront;
	card.frame.back = frameBase + card.frameBack;
	delete card.frameID;
	delete card.frameName;
	delete card.frameFront;
	delete card.frameBack;

	card.anime = {};
	card.anime.id = card.animeID;
	card.anime.name = card.animeName;
	delete card.animeID;
	delete card.animeName;

	card.effect = {};
	card.effect.id = card.effectID;
	card.effect.image = effectBase + card.effectImage;
	card.effect.opacity = card.effectOpacity;
	delete card.effectID;
	delete card.effectImage;
	delete card.effectOpacity;
}
async function getCardUUID(uuid, userID) {
	let card = await database.getCardUUID(uuid, userID);
	if (card === undefined) return undefined;

	card.card = {};
	card.card.id = card.cardID;
	delete card.cardID;

	card.frame = {};
	card.frame.id = card.frameID;
	delete card.frameID;

	return card;
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
function getTradeCooldownMax() {
	return tradeCooldownMax;
}
function getAnimePackCooldown() {
	return animePackCooldown;
}
function getAnimePackSize() {
	return animePackSize;
}
function getCardBase() {
	return cardBase;
}
function getFrameBase() {
	return frameBase;
}
function getEffectBase() {
	return effectBase;
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
	fillCard: fillCard,
	fillCards: fillCards,
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
	getPackTime: getPackTime,
	handleException: handleException,
	sendVerification: sendVerification,
	checkMail: checkMail,
	verifyMail: verifyMail,
	getTradeCooldownMax: getTradeCooldownMax,
	getAnimePackCooldown: getAnimePackCooldown,
	getAnimePackSize: getAnimePackSize,
	getAnimePackTime: getAnimePackTime,
	removeCardFromUserCache: removeCardFromUserCache,
	getBadges: getBadges,
	sendFriendReqeust: sendFriendReqeust,
	getImageBase: getCardBase,
	getFrameBase: getFrameBase,
	getEffectBase: getEffectBase,
	inventory: inventory,
	formatCards: formatCards,
	getCardUUID: getCardUUID
};
