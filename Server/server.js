const express = require("express");
const bodyParser = require("body-parser");
const database = require("./database");
const app = express();
const jwt = require("jsonWebToken");
require("datejs");
const Client = require("./cache");
const cache = require("./serverCache");
const jwtSecret = "yCSgVxmL9I";
const moment = require("moment");
const utils = require("./utils");

app.use(express.static("Data"));
const imageBase = "Card/";
const frameBase = "Frame/";

const port = 100;

const userLen = [4, 20];
const userRegex = /^[a-zA-Z0-9_]+$/;
const passLen = [8, 30];
const packSize = [1, 1];
//const passRegex = /^[a-zA-Z0-9_]*}$/;
const inventorySendAmount = 10;
const friendLimit = 50;

var clients = {};

var cacheTime = 10000;
var packCooldown = 10;
var qualityrange = [1, 7];
var cardCashInterval = 3600000;
//var cardCashInterval = 10000;

app.use(bodyParser.json());

app.get("/", function (req, res) {
	res.send("Hello World");
});

app.post("/login", (req, res) => {
	var username = req.body.username;
	var password = req.body.password;
	console.log("Login " + username + " " + password);
	database.login(username, password, (b, messageV, userIDV) => {
		var tokenV = "";
		if (b) tokenV = jwt.sign({ username: username, id: userIDV }, jwtSecret);

		if (b)
			res.send({
				status: b ? 0 : 1,
				token: tokenV,
				userID: userIDV,
				message: messageV,
			});
		else res.send({ status: b ? 0 : 1, token: tokenV, message: messageV });

		if (b) {
			createCache(userIDV, username, () => {});
		}
	});
});

app.post("/register", (req, res) => {
	var username = req.body.username;
	var password = req.body.password;

	switch (checkUser(username)) {
		case 1: {
			registerCallback(
				false,
				"the username length must be between " +
					userLen[0] +
					" and " +
					userLen[1]
			);
			return;
		}
		case 2: {
			registerCallback(
				false,
				"the user can only contain letters, numbers and _"
			);
			return;
		}
	}

	switch (checkPass(password)) {
		case 1: {
			registerCallback(
				false,
				"the password length must be between " +
					passLen[0] +
					" and " +
					passLen[1]
			);
			return;
		}
	}

	console.log("Register " + username + " " + password);
	database.register(username, password, registerCallback);

	function registerCallback(b, message) {
		res.send({ status: b ? 0 : 1, message: message });
	}
});

app.post("/getDashboard", (req, res) => {
	var token = req.body.token;
	try {
		var decoded = jwt.verify(token, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 2, message: "Identification Please" });
		return;
	}

	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		run(decoded.id);
	}

	function run(userID) {
		//username
		username = clients[userID].username;

		if (!username || username == "null" || username == null) {
			res.send({
				status: 2,
				message: "User with userID " + userID + " not found!",
			});
			return;
		}
		//friends
		var friendcount = clients[userID].getFriends().length;
		var maxfriendcount = friendLimit;

		//packtime
		var nowDate = moment();
		var packDate = moment(parseInt(clients[userID].packTime));

		if (
			clients[userID] == null ||
			clients[userID].packTime == "null" ||
			nowDate.isAfter(packDate) ||
			!packDate.isValid()
		) {
			res.send({
				status: 0,
				packTime: 0,
				fullTime: packCooldown * 1000,
				name: username,
				friendcount: friendcount,
				maxfriendcount: maxfriendcount,
			});
			return;
		} else {
			res.send({
				status: 1,
				packTime: packDate.diff(nowDate).seconds(),
				fullTime: packCooldown * 1000,
				name: username,
				friendcount: friendcount,
				maxfriendcount: maxfriendcount,
			});
		}
	}
	return;
});

app.post("/pack", (req, res) => {
	var tokenV = req.body.token;
	try {
		var decoded = jwt.verify(tokenV, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 1, message: "Identification Please" });
		return;
	}
	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		clients[decoded.id].refresh();
		run();
	}
	function run() {
		if (clients[decoded.id].packTime != null) {
			packCallBack(decoded.id);
			return;
		} else {
			createCache(decoded.id, decoded.username, () => {
				packCallBack(decoded.id);
			});
			return;
		}

		function packCallBack(userID) {
			if (clients[userID] == undefined) {
				createCache(userID, decoded.username, run);
			} else {
				run(userID);
			}

			function run(userID) {
				var nowDate = moment();
				var date = moment(nowDate).add(packCooldown, "seconds");
				var packDate = moment(parseInt(clients[userID].packTime));

				if (
					clients[userID] == null ||
					clients[userID].packTime == "null" ||
					nowDate.isAfter(packDate) ||
					!packDate.isValid()
				) {
					clients[userID].packTime = date.valueOf();
					var iterations = utils.getRandomInt(packSize[0], packSize[1]);
					database.getRandomCard(iterations, (cards) => {
						for (var j = 0; j < cards.length; j++) {
							var quality = utils.getRandomInt(
								qualityrange[0],
								qualityrange[1]
							);
							cards[j].quality = quality;
							cards[j].cardImage = imageBase + cards[j].cardImage;
						}
						database.getRandomFrame(iterations, (frames) => {
							for (var j = 0; j < frames.length; j++) {
								frames[j].path_front = frameBase + frames[j].path_front;
								frames[j].path_back = frameBase + frames[j].path_back;
							}

							for (var j = frames.length - 1; j < iterations; j++) {
								frames[j] = frames[utils.getRandomInt(0, frames.length - 1)];
							}
							run3(0);
							function run3(j) {
								cards[j].frame = frames[j];
								database.addCard(
									userID,
									cards[j].id,
									quality,
									0,
									frames[j].id,
									(insertID) => {
										clients[userID].addCard({
											id: insertID,
											userID: userID,
											cardID: cards[j].id,
											quality: quality,
											level: 0,
											frameID: frames[j].id,
										});
										if (j == cards.length - 1) {
											run2(0);
											return;
										} else {
											run3(j + 1);
										}
									}
								);
							}
							function run2(iteration) {
								database.getCardType(cards[iteration].typeID, (result) => {
									cards[iteration].type = result;
									if (iteration == iterations - 1) {
										res.send({ packTime: "0", message: "OK", cards: cards });
										return;
									} else {
										run2(iteration + 1);
									}
								});
							}
						});
					});
				} else {
					res.send({
						packTime: packDate.diff(nowDate).seconds(),
						message: "WAIT",
						cards: [],
					});
					return;
				}
			}
		}
	}
});

app.post("/passchange", (req, res) => {
	var tokenV = req.body.token;
	try {
		var decoded = jwt.verify(tokenV, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 1, message: "Identification Please" });
		return;
	}
	var username = decoded.username;
	var newpassword = req.body.newpassword;
	console.log("Passchange: " + username + " " + newpassword);
	switch (checkPass(newpassword)) {
		case 1: {
			res.send({
				status: 1,
				message:
					"the password length must be between " +
					passLen[0] +
					" and " +
					passLen[1],
			});
			return;
		}
	}
	database.userexists(username, (b) => {
		if (b) {
			database.changePass(username, newpassword);
			res.send({ status: 0, message: "Password changed" });
		} else {
			res.send({ status: 1, message: "Failed" });
		}
	});
});

app.post("/getfriends", (req, res) => {
	var tokenV = req.body.token;
	try {
		var decoded = jwt.verify(tokenV, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({
			status: 1,
			message: '"TF you doing here nigga, identify yourself, who tf are you"',
		});
		return;
	}

	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		run(decoded.id);
	}

	function run(userID) {
		var friendIDs = clients[userID].getFriends();
		var friends = [];
		for (var i = 0; i < friendIDs.length; i++) {
			var id = friendIDs[i];
			if (clients[id] != undefined) {
				friends.push({ userID: id, username: clients[id].username });

				if (i == friendIDs.length) {
					res.send({ status: 0, friends: friends });
				}
			} else {
				database.getUserName(id, (username) => {
					if (username != null) {
						createCache(id, username, () => {
							friends.push({ userID: id, username: clients[id].username });
							if (i == friendIDs.length) {
								res.send({ status: 0, friends: friends });
							}
						});
					}
				});
			}
		}
	}
});

app.post("/inventory", (req, res) => {
	var tokenV = req.body.token;
	var page = req.body.page;
	var search = req.body.search;
	var next = req.body.next;
	if (next == undefined) next = -1;
	if (page == undefined) page = 0;
	if (search == undefined) search = "";
	try {
		var decoded = jwt.verify(tokenV, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 1, message: "Identification Please" });
		return;
	}
	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		run(decoded.id);
	}
	function run(userID) {
		var ids = cache.getIdsByString(search);
		if (next == 0) {
			var inventory = clients[userID].nextPage(inventorySendAmount);
		} else if (next == 1) {
			var inventory = clients[userID].prevPage(inventorySendAmount);
		} else
			var inventory = clients[userID].getInventory(
				page,
				inventorySendAmount,
				ids
			);
		var pageStats = clients[userID].getPageStats();
		if (inventory.length == 0) {
			res.send({
				status: 0,
				inventory: inventory,
				page: pageStats[0],
				pagemax: pageStats[1],
			});
			return;
		}
		run2(0);
		function run2(iteration) {
			getCard(
				inventory[iteration].cardID,
				inventory[iteration].frameID,
				(card) => {
					inventory[iteration].card = card;
					if (iteration == inventory.length - 1) {
						res.send({
							status: 0,
							inventory: inventory,
							page: pageStats[0],
							pagemax: pageStats[1],
						});

						return;
					} else {
						run2(iteration + 1);
					}
				}
			);
		}
	}
});

app.post("/card", (req, res) => {
	var tokenV = req.body.token;
	var uuid = req.body.uuid;
	uuid = parseInt(uuid);
	var next = req.body.next;
	var page = req.body.page;
	if (page == undefined) page = 0;
	if (next == undefined) next = -1;
	if (next == -1) {
		if (uuid == undefined) {
			res.send({ status: 1, message: "Invalid data" });
			return;
		}
	}

	try {
		var decoded = jwt.verify(tokenV, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 1, message: "Identification Please" });
		return;
	}

	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		run();
	}
	function run() {
		getCardRequestData(decoded.id, uuid, next, page, (data) => {
			res.send(data);
		});
	}
});

app.post("/upgrade", (req, res) => {
	var tokenV = req.body.token;
	var carduuid = req.body.carduuid;
	var mainuuid = req.body.mainuuid;
	if (carduuid == undefined && mainuuid == undefined) {
		res.send({ status: 1, message: "Invalid data" });
		return;
	}

	try {
		var decoded = jwt.verify(tokenV, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 1, message: "Identification Please" });
		return;
	}

	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		run();
	}

	function run() {
		database.getCardUUID(mainuuid, decoded.id, (mainresult) => {
			if (mainresult == undefined) {
				res.send({
					status: 1,
					message: "Cant find card, or it isnt yours",
				});
				return;
			}
			database.getCardUUID(carduuid, decoded.id, (cardresult) => {
				if (cardresult == undefined) {
					res.send({
						status: 1,
						message: "Cant find card, or it isnt yours",
					});
					return;
				}
				if (
					cardresult.cardID != mainresult.cardID ||
					cardresult.level != mainresult.level
				) {
					res.send({
						status: 1,
						message: "Cant upgrade these cards",
					});
				}
				var newquality = Math.round(
					(cardresult.quality + mainresult.quality) / 2
				);
				var newlevel = cardresult.level + 1;
				database.addCard(
					decoded.id,
					cardresult.cardID,
					newquality,
					newlevel,
					mainresult.frameID,
					(insertID) => {
						clients[decoded.id].addCard({
							id: insertID,
							userID: decoded.id,
							cardID: cardresult.cardID,
							quality: newquality,
							level: newlevel,
							frameID: mainresult.frameID,
						});
						res.send({ status: 0, uuid: insertID });
					}
				);
			});
		});
	}
});

app.post("/friends", (req, res) => {
	var token = req.body.token;

	try {
		var decoded = jwt.verify(token, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 1, message: "Identification Please" });
		return;
	}

	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		run();
	}

	function run() {
		var friends = clients[decoded.id].getFriends();
		var data = [];
		run2(0);
		function run2(i) {
			if (i == friends.length) {
				res.send({ status: 0, friends: data });
				return;
			}

			var username = undefined;
			if (clients[friends[i].userID] != undefined) {
				username = clients[friends[i].userID].username;
				insert();
			} else
				database.getUserName(friends[i].userID, (user) => {
					username = user;
					insert();
				});
			function insert() {
				data.push({
					userID: friends[i].userID,
					status: friends[i].status,
					username: username,
				});
				run2(i + 1);
			}
		}
	}
});

app.post("/addfriend", (req, res) => {
	var token = req.body.token;
	var username = req.body.username;

	try {
		var decoded = jwt.verify(token, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 1, message: "Identification Please" });
		return;
	}

	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		run();
	}

	function run() {
		database.getUserID(username, (id) => {
			if (id == undefined) {
				res.send({ status: 1, message: "cant find user" });
				return;
			}
			if (id == decoded.id) {
				res.send({ status: 1, message: "cant add yourself" });
				return;
			}
			if (clients[decoded.id].hasFriend(id)) {
				res.send({ status: 1, message: "already added" });
				return;
			}
			if (clients[userID].getFriends().length == friendLimit) {
				res.send({ status: 1, message: "reached max friend count" });
				return;
			}
			clients[decoded.id].addFriendRequest(id);
			database.addFriendRequest(decoded.id, id, () => {
				res.send({ status: 0 });
				return;
			});
		});
	}
});

app.post("/acceptfriend", (req, res) => {
	var token = req.body.token;
	var userID = req.body.userID;
	var userID = parseInt(userID);

	if (isNaN(userID) || userID == undefined) {
		res.send({ status: 1, message: "not a userID" });
		return;
	}

	try {
		var decoded = jwt.verify(token, jwtSecret);
	} catch (JsonWebTokenError) {
		res.send({ status: 1, message: "Identification Please" });
		return;
	}

	if (clients[decoded.id] == undefined) {
		createCache(decoded.id, decoded.username, run);
	} else {
		run();
	}

	function run() {
		if (!clients[decoded.id].acceptFriendRequest(userID)) {
			res.send({ status: 1, message: "user not found" });
			return;
		}
		database.acceptFriendRequest(userID, decoded.id, () => {
			res.send({ status: 0 });
			return;
		});
	}
});

function getCardRequestData(userID, uuid, next, page, callback) {
	var inventory;
	var maincard;
	var pageStats;
	if (uuid == undefined || isNaN(uuid) || uuid == null) {
		uuid = clients[userID].lastmain;
		if (uuid == undefined) {
			callback({ status: 1, message: "No main uuid" });
			return;
		}
	} else {
		clients[userID].lastmain = uuid;
	}
	database.getCardUUID(uuid, userID, (result) => {
		if (result == undefined) {
			callback({
				status: 1,
				message: "Cant find card, or it isnt yours",
			});
			return;
		}
		var ids = [result.cardID];
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
				result.level
			);
		pageStats = clients[userID].getPageStats();
		getCard(result.cardID, result.frameID, (_maincard) => {
			maincard = _maincard;
			maincard.level = result.level;
			maincard.quality = result.quality;
			maincard.uuid = parseInt(uuid);
			run2(0);
		});
	});
	function run2(iteration) {
		if (inventory.length == 0) {
			callback({
				status: 0,
				inventory: inventory,
				card: maincard,
				page: pageStats[0],
				pagemax: pageStats[1],
			});
			return;
		}
		getCard(
			inventory[iteration].cardID,
			inventory[iteration].frameID,
			(card) => {
				inventory[iteration].card = card;

				if (iteration == inventory.length - 1) {
					callback({
						status: 0,
						inventory: inventory,
						card: maincard,
						page: pageStats[0],
						pagemax: pageStats[1],
					});
					return;
				} else {
					run2(iteration + 1);
				}
			}
		);
	}
}

function getCard(cardID, frameID, callback) {
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
				callback(card);
			});
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
		password.length < userLen[0] ||
		password.length > userLen[1]
	)
		return 1;
	//if(!passRegex.test(password)) return 2;
	return 0;
}

function createCache(userIDV, username, callback) {
	if (!clients[userIDV]) {
		clients[userIDV] = new Client(userIDV, username, callback);
		clients[userIDV].startDecay(cacheTime, clearCache);
	}
}

function clearCache(userID) {
	clients[userID].save();
	delete clients[userID];
}

console.log("Initializing DataBase");
database.init(() => {
	cache.refreshCards(() => {
		var server = app.listen(port);
		console.log("Started on port %s", port);
	});
});
setInterval(() => {
	cache.refreshCards(() => {});
}, cardCashInterval);
