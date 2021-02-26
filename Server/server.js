const express = require("express");
const bodyParser = require("body-parser");
const database = require("./database");
const app = express();
const jwt = require("jsonwebtoken");
require("datejs");
const Client = require("./cache");
const cache = require("./serverCache");
const jwtSecret = "yCSgVxmL9I";
const moment = require("moment");
const utils = require("./utils");
const fs = require("fs");

const upload = require("express-fileupload");

app.use(upload());

const csv = require("csv-string");

app.use(express.static("Data"));
const imageBase = "Card/";
const frameBase = "Frame/";

const config = require("./config.json");
const { randomInt } = require("crypto");
const { response } = require("express");

const port = config.port;

const userLen = [4, 20];
const userRegex = /^[a-zA-Z0-9_]+$/;
const passLen = [8, 30];
const packSize = [1, 1];
const passRegex = /^[a-zA-Z0-9_.]+$/;
const inventorySendAmount = config.inventorySendAmount;
const friendLimit = config.friendLimit;

var clients = {};

var cacheTime = 900000;
var packCooldown = config.packCooldown;
var qualityrange = [1, 5];
var cardCashInterval = 3600000;
//var cardCashInterval = 10000;

app.use(bodyParser.json());

app.get("/", function (req, res) {
	res.send("WaifuCollector");
});

app.get("/cards", function (req, res) {
	database.getCards((cards) => {
		if (cards != undefined) {
			res.send({ status: 1, cards: cards });
		} else {
			res.send({ status: 0 });
		}
	});
});

app.get("/cards/export", function (req, res) {
	database.getCards((cards) => {
		var fileContent = "";

		if (cards != undefined) {
			cards.forEach(function (card) {
				if (card != undefined) {
					fileContent +=
						card["cardName"] +
						"," +
						card["typeID"] +
						"," +
						card["cardImage"] +
						"\n";
				}
			});
		}

		res.set("content-type", "text/csv");
		res.set("Content-Disposition", "attachment; filename=card_export.csv");

		res.send(fileContent);
	});
});

app.post("/cards/import", function (req, res) {
	try {
		if (!req.files || !req.files.cardCSV) {
			res.send({ status: 0, message: "No file uploaded!" });
			return;
		}

		let file = req.files.cardCSV;

		var data = file.data.toString("utf8");

		var dataArray = csv.parse(data);

		dataArray.forEach(function (card) {
			database.registerCard(card[0], card[1], card[2], (result) => {
				if (!result) {
					console.log("Couldn't register " + card[0] + "!");
				}
			});
		});

		if (req.query && req.query.redirUrl) {
			res.redirect(req.query.redirUrl);
			return;
		}

		res.redirect("/");
	} catch (err) {
		res.send({ status: 0 });

		console.log(err);
	}
});

app.get("/card/:cardID/", function (req, res) {
	database.getCard(req.params.cardID, (card) => {
		if (card != undefined) {
			res.send({ status: 1, card: card });
		} else {
			res.send({ status: 0 });
		}
	});
});

app.post("/card/:cardID/update", function (req, res) {
	function redirect(res, req, query) {
		if (req.query && req.query.redirUrl) {
			res.redirect(req.query.redirUrl + "?" + query);
		} else {
			res.redirect("/?" + query);
		}
	}

	var cardID = req.params.cardID;
	var name = req.body.name;
	var animeID = req.body.anime;

	var changedName = false;
	var changedAnimeID = false;

	if (name) changedName = database.updateCardName(cardID, name);

	if (animeID) changedAnimeID = database.updateCardAnime(cardID, animeID);

	if (changedAnimeID != undefined || changedName != undefined) {
		redirect(
			res,
			req,
			"status=failed&changedAnimeID=" +
				changedAnimeID +
				"&changedName=" +
				changedName
		);
	} else {
		redirect(res, req, "status=success");
	}
});

app.get("/display/card/:cardID/", function (req, res) {
	database.getCardDisplay(req.params.cardID, (card) => {
		if (card != undefined) {
			res.send({ status: 1, card: card });
		} else {
			res.send({ status: 0 });
		}
	});
});

app.get("/display/cards", function (req, res) {
	database.getCardsDisplay((cards) => {
		if (cards != undefined) {
			res.send({ status: 1, cards: cards });
		} else {
			res.send({ status: 0 });
		}
	});
});

app.get("/animes", function (req, res) {
	database.getAnimes((animes) => {
		if (animes != undefined) {
			res.send({ status: 1, animes: animes });
		} else {
			res.send({ status: 0 });
		}
	});
});

app.get("/users", function (req, res) {
	database.getUsers((users) => {
		if (users != undefined) {
			res.send({ status: 1, users: users });
		} else {
			res.send({ status: 0 });
		}
	});
});

app.get("/:id/rank", function (req, res) {
	var userID = req.params.id;

	if (userID) {
		database.getUserRank(userID, (rankID) => {
			if (rankID != undefined) {
				res.send({
					status: 1,
					rankID: rankID,
				});
			} else {
				res.send({
					status: 0,
					message: "RankID not found",
				});
			}
		});
	} else {
		res.send({
			status: 0,
			message: "Missing userID given",
		});
	}
});

app.post("/notifications", (req, res) => {
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
		clients[decoded.id].refresh();
		run(decoded.id);
	}

	function run() {
		database.getNotifications(decoded.id, (result) => {
			res.send({ status: 0, data: result });
			return;
		});
	}
});

app.post("/login", (req, res) => {
	try {
		var username = req.body.username;
		var password = req.body.password;
		//console.log("Login " + username + " " + password);
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
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/register", (req, res) => {
	try {
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

		//console.log("Register " + username + " " + password);
		database.register(username, password, registerCallback);

		function registerCallback(b, message) {
			res.send({ status: b ? 0 : 1, message: message });
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/getDashboard", (req, res) => {
	try {
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
			clients[decoded.id].refresh();
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

			//cardAmount
			var cardCount = clients[userID].getCardTypeAmount();
			var cardMax = cache.getCardAmount();

			//packtime
			res.send({
				status: 0,
				packTime: getPackTime(userID),
				fullTime: packCooldown * 1000,
				cardCount: cardCount,
				cardMax: cardMax,
				name: username,
				friendcount: friendcount,
				maxfriendcount: maxfriendcount,
			});
		}
		return;
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.get("/packTime", (req, res) => {
	try {
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
			clients[decoded.id].refresh();
			run(decoded.id);
		}
		function run() {
			res.send({ status: 0, packTime: getPackTime(decoded.id) });
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

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

app.post("/pack", (req, res) => {
	try {
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
			var nowDate = moment();
			var date = moment(nowDate).add(packCooldown, "seconds");
			var packDate = moment(parseInt(clients[decoded.id].packTime));

			if (
				clients[decoded.id] == null ||
				clients[decoded.id].packTime == "null" ||
				nowDate.isAfter(packDate) ||
				!packDate.isValid()
			) {
				clients[decoded.id].packTime = date.valueOf();
				var iterations = utils.getRandomInt(packSize[0], packSize[1]);
				database.getRandomCard(iterations, (cards) => {
					for (var j = 0; j < cards.length; j++) {
						var quality = utils.getRandomInt(qualityrange[0], qualityrange[1]);
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
								decoded.id,
								cards[j].id,
								quality,
								0,
								frames[j].id,
								(insertID) => {
									cards[j].uuid = insertID;
									clients[decoded.id].addCard({
										id: insertID,
										userID: decoded.id,
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
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/passchange", (req, res) => {
	try {
		var tokenV = req.body.token;
		try {
			var decoded = jwt.verify(tokenV, jwtSecret);
		} catch (JsonWebTokenError) {
			res.send({ status: 1, message: "Identification Please" });
			return;
		}
		var username = decoded.username;
		var newpassword = req.body.newpassword;
		//console.log("Passchange: " + username + " " + newpassword);
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
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/getfriends", (req, res) => {
	try {
		var tokenV = req.body.token;
		try {
			var decoded = jwt.verify(tokenV, jwtSecret);
		} catch (JsonWebTokenError) {
			res.send({
				status: 1,
				message: "Identification missin",
			});
			return;
		}

		if (clients[decoded.id] == undefined) {
			createCache(decoded.id, decoded.username, run);
		} else {
			clients[decoded.id].refresh();
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
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/inventory", (req, res) => {
	try {
		var tokenV = req.body.token;
		var page = req.body.page;
		var search = req.body.search;
		var next = req.body.next;
		var sortType = req.body.sortType;
		sortType = parseInt(sortType);

		var friendID = req.body.userID;
		var friendID = parseInt(friendID);

		if (next == undefined) next = -1;
		if (page == undefined) page = 0;
		if (search == undefined) search = "";
		if (isNaN(sortType)) sortType = undefined;
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
			run(decoded.id);
		}
		function run(userID) {
			var ids = clients[userID].lastids;
			if (clients[userID].lastsearch != search) {
				clients[userID].lastsearch = search;
				ids = cache.getIdsByString(search);
			}
			var exclude = [];
			if (!isNaN(friendID)) {
				database.getTrade(userID, friendID, (ex) => {
					for (var i = 0; ex != undefined && i < ex.length; i++) {
						exclude.push(ex[i].card);
					}
					run3();
				});
			} else {
				run3();
			}
			function run3() {
				if (next == 0) {
					var inventory = clients[userID].nextPage(inventorySendAmount);
				} else if (next == 1) {
					var inventory = clients[userID].prevPage(inventorySendAmount);
				} else
					var inventory = clients[userID].getInventory(
						page,
						inventorySendAmount,
						ids,
						exclude,
						undefined,
						sortType
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
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/card", (req, res) => {
	try {
		var tokenV = req.body.token;
		var uuid = req.body.uuid;
		uuid = parseInt(uuid);
		var next = req.body.next;
		var page = req.body.page;
		var sortType = req.body.sortType;
		sortType = parseInt(sortType);
		if (page == undefined) page = 0;
		if (next == undefined) next = -1;
		if (isNaN(sortType)) sortType = undefined;
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
			clients[decoded.id].refresh();
			run();
		}
		function run() {
			getCardRequestData(decoded.id, uuid, next, page, sortType, (data) => {
				res.send(data);
			});
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/upgrade", (req, res) => {
	try {
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
			clients[decoded.id].refresh();
			run();
		}

		function run() {
			if (mainuuid == carduuid) {
				res.send({
					status: 1,
					message: "Cant upgrade itself",
				});
				return;
			}

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

					var chance = (cardresult.quality + mainresult.quality) * 10;

					var succes = true;
					var r = utils.getRandomInt(0, 100);
					if (r > chance) succes = false;

					var newlevel = 0;
					var newquality = 0;
					if (succes) {
						newlevel = cardresult.level + 1;
						newquality = utils.getRandomInt(qualityrange[0], qualityrange[1]);
					} else {
						newlevel = cardresult.level;
						newquality = Math.round(
							(cardresult.quality + mainresult.quality) / 2
						);
					}
					clients[decoded.id].deleteCard(carduuid);
					clients[decoded.id].deleteCard(mainuuid);
					database.deleteCard(carduuid, () => {
						database.deleteCard(mainuuid, () => {
							removeTrade(carduuid, mainuuid, () => {
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
					});
				});
			});
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

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

app.post("/friends", (req, res) => {
	try {
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
			clients[decoded.id].refresh();
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
						status: friends[i].friend_status,
						username: username,
					});
					run2(i + 1);
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/addfriend", (req, res) => {
	try {
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
			clients[decoded.id].refresh();
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
				if (clients[decoded.id].getFriends().length == friendLimit) {
					res.send({ status: 1, message: "reached max friend count" });
					return;
				}
				if (clients[id] != undefined) {
					if (clients[id].hasFriend(decoded.id)) {
						res.send({ status: 1, message: "already sent" });
						return;
					}
					run2();
				} else {
					database.isFriendPending(decoded.id, id, (b) => {
						if (b) {
							res.send({ status: 1, message: "already sent" });
							return;
						}
						run2();
					});
				}
				function run2() {
					clients[decoded.id].addFriendRequest(id);
					if (clients[id] != undefined)
						clients[id].addFriendRequestIncoming(decoded.id);
					database.addFriendRequest(decoded.id, id, () => {
						database.addNotification(
							id,
							"Friend Request",
							"You got a new friend request, click to view!",
							"friends",
							() => {}
						);
						res.send({ status: 0 });
						return;
					});
				}
			});
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/managefriend", (req, res) => {
	try {
		var token = req.body.token;
		var userID = req.body.userID;
		var userID = parseInt(userID);
		var command = req.body.command;
		var command = parseInt(command);

		if (isNaN(userID) || isNaN(command)) {
			res.send({ status: 1, message: "not a userID" });
			return;
		}

		if (command != 0 && command != 1) {
			res.send({ status: 1, message: "wrong data" });
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
			clients[decoded.id].refresh();
			run();
		}
		function run() {
			if (command == 0) {
				if (!clients[decoded.id].acceptFriendRequest(userID)) {
					res.send({ status: 1, message: "user not found" });
					return;
				}
				if (clients[userID] != undefined)
					clients[userID].friendRequestAccepted(decoded.id);
				database.acceptFriendRequest(userID, decoded.id, () => {
					database.addNotification(
						decoded.id,
						"Friend Accepted",
						"You friend request got accepted, click to view!",
						"friends",
						() => {}
					);
					res.send({ status: 0 });
					return;
				});
			} else if (command == 1) {
				if (!clients[decoded.id].deleteFriend(userID)) {
					res.send({ status: 1, message: "user not found" });
					return;
				}
				if (clients[userID] != undefined)
					clients[userID].deleteFriend(decoded.id);
				database.deleteFriend(userID, decoded.id, () => {
					res.send({ status: 0 });
					return;
				});
			}
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/trade", (req, res) => {
	try {
		var token = req.body.token;
		var userID = req.body.userID;
		var userID = parseInt(userID);

		if (isNaN(userID)) {
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
			clients[decoded.id].refresh();
			run();
		}
		function run() {
			if (!clients[decoded.id].hasFriendAdded(userID)) {
				res.send({ status: 1, message: "not your friend" });
				return;
			}

			var username = undefined;
			if (clients[userID] != undefined) {
				username = clients[userID].username;
				onusername();
			} else
				database.getUserName(userID, (user) => {
					username = user;
					onusername();
				});
			function onusername() {
				data = {};
				var tradeok = 0;
				var tradeokother = 0;
				database.getTrade(decoded.id, userID, (trades) => {
					data.selfcards = [];
					run2(0);
					function run2(i) {
						if (trades != undefined && i != trades.length) {
							database.getCardUUID(trades[i].card, decoded.id, (result) => {
								if (result == undefined) {
									res.send({ status: 1, message: "error" });
									return;
								}

								getCard(result.cardID, result.frameID, (_card) => {
									card = _card;
									card.level = result.level;
									card.quality = result.quality;
									card.uuid = parseInt(trades[i].card);
									data.selfcards.push(card);
									run2(i + 1);
								});
							});
						} else {
							database.getTradeManager(decoded.id, userID, (tm) => {
								if (tm != undefined) {
									if (tm[0].userone == decoded.id) {
										tradeok = tm[0].statusone;
										tradeokother = tm[0].statustwo;
									} else {
										tradeok = tm[0].statustwo;
										tradeokother = tm[0].statusone;
									}
								}
								database.getTrade(userID, decoded.id, (trades) => {
									data.friendcards = [];
									run3(0);
									function run3(i) {
										if (trades != undefined && i != trades.length) {
											database.getCardUUID(trades[i].card, userID, (result) => {
												if (result == undefined) {
													res.send({ status: 1, message: "error" });
													return;
												}

												getCard(result.cardID, result.frameID, (_card) => {
													card = _card;
													card.level = result.level;
													card.quality = result.quality;
													card.uuid = parseInt(trades[i].card);
													data.friendcards.push(card);
													run3(i + 1);
												});
											});
										} else {
											res.send({
												status: 0,
												data: data,
												username: username,
												statusone: tradeok,
												statustwo: tradeokother,
											});
										}
									}
								});
							});
						}
					}
				});
			}
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/addtrade", (req, res) => {
	try {
		var token = req.body.token;
		var userID = req.body.userID;
		var userID = parseInt(userID);
		var cardID = req.body.cardID;
		var cardID = parseInt(cardID);

		if (isNaN(userID) || isNaN(cardID)) {
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
			clients[decoded.id].refresh();
			run();
		}
		function run() {
			if (!clients[decoded.id].hasFriendAdded(userID)) {
				res.send({ status: 1, message: "not your friend" });
				return;
			}

			database.getCardUUID(cardID, decoded.id, (result) => {
				if (result == undefined) {
					res.send({
						status: 1,
						message: "Cant find card, or it isnt yours",
					});
					return;
				}
				database.tradeExists(decoded.id, userID, cardID, (b) => {
					if (b) {
						res.send({ status: 1, message: "Card already in trade" });
						return;
					}
					database.addTrade(decoded.id, userID, cardID, () => {
						setTrade(decoded.id, userID, 0, () => {
							setTrade(userID, decoded.id, 0, () => {
								//console.log(userID);
								database.addNotification(
									userID,
									"Trade Changed",
									"A card got added to the trade, click to view!",
									"trade?userID=" + decoded.id,
									() => {}
								);
								res.send({ status: 0 });
								return;
							});
						});
					});
				});
			});

			return;
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/removetrade", (req, res) => {
	try {
		var token = req.body.token;
		var userID = req.body.userID;
		var userID = parseInt(userID);
		var cardID = req.body.cardID;
		var cardID = parseInt(cardID);

		if (isNaN(userID) || isNaN(cardID)) {
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
			clients[decoded.id].refresh();
			run();
		}

		function run() {
			database.removeTradeUser(cardID, decoded.id, userID, () => {
				setTrade(decoded.id, userID, 0, () => {
					setTrade(userID, decoded.id, 0, () => {
						database.addNotification(
							userID,
							"Trade Changed",
							"A card got removed from the trade, click to view!",
							"trade?userID=" + decoded.id,
							() => {}
						);
						res.send({ status: 0 });
					});
				});
			});
			return;
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/okTrade", (req, res) => {
	try {
		var token = req.body.token;
		var userID = req.body.userID;
		var userID = parseInt(userID);

		if (isNaN(userID)) {
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
			createCache(decoded.id, decoded.username, secondCache);
		} else {
			clients[decoded.id].refresh();
			secondCache();
		}

		function secondCache() {
			if (clients[userID] == undefined) {
				database.getUserName(userID, (username) => {
					if (username == undefined) {
						res.send({ status: 1, message: "User not found" });
						return;
					}
					createCache(userID, username, run);
				});
			} else {
				clients[userID].refresh();
				run();
			}
		}
		function run() {
			setTrade(decoded.id, userID, 1, () => {
				database.getTradeManager(decoded.id, userID, (tm) => {
					if (tm != undefined && tm[0].statusone == 1 && tm[0].statustwo == 1) {
						transfer(decoded.id, userID, () => {
							transfer(userID, decoded.id, () => {
								setTrade(decoded.id, userID, 0, () => {
									setTrade(userID, decoded.id, 0, () => {
										database.addNotification(
											userID,
											"Trade Complete",
											"A trade has been complete, click to view!",
											"trade?userID=" + decoded.id,
											() => {}
										);
										res.send({ status: 0 });
										return;
									});
								});
							});
						});
						function transfer(userone, usertwo, callback) {
							database.getTrade(userone, usertwo, (cards) => {
								for (var i = 0; i < cards.length; i++) {
									var c = clients[userone].getCard(cards[i].card);
									clients[usertwo].addCard({
										id: cards[i].card,
										userID: userID,
										cardID: c.cardID,
										quality: c.quality,
										level: c.level,
										frameID: c.frameID,
									});
									clients[userone].deleteCard(cards[i].card);
								}
								run2(0);
								function run2(idx) {
									if (idx == cards.length) {
										callback();
										return;
									}
									database.removeTrade(cards[idx].card, () => {
										database.changeCardUser(cards[idx].card, usertwo, () => {
											run2(idx + 1);
										});
									});
								}
							});
						}
					} else {
						database.addNotification(
							userID,
							"Trade Confirmed",
							"A trade has been confirmed, click to view!",
							"trade?userID=" + decoded.id,
							() => {}
						);
						res.send({ status: 0 });
						return;
					}
				});
			});
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/deleteNotification", (req, res) => {
	try {
		var token = req.body.token;
		var notificationID = req.body.notificationID;
		var notificationID = parseInt(notificationID);

		if (isNaN(notificationID)) {
			res.send({ status: 1, message: "not a notificationID" });
			return;
		}

		try {
			var decoded = jwt.verify(token, jwtSecret);
		} catch (JsonWebTokenError) {
			res.send({ status: 1, message: "Identification Please" });
			return;
		}

		database.removeNotification(notificationID, decoded.id, () => {
			res.send({ status: 0 });
		});
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

app.post("/deleteAllNotifications", (req, res) => {
	try {
		var token = req.body.token;

		try {
			var decoded = jwt.verify(token, jwtSecret);
		} catch (JsonWebTokenError) {
			res.send({ status: 1, message: "Identification Please" });
			return;
		}

		database.removeNotifications(decoded.id, () => {
			res.send({ status: 0 });
		});
	} catch (e) {
		console.log(e);
		res.send({ status: 1, message: "internal server error" });
		return;
	}
});

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
				result.level,
				sortType
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
	if (!passRegex.test(password)) return 2;
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
		//var server = https.createServer(options, app).listen(port);
		console.log("Started on port %s", port);
	});
	setInterval(() => {
		cache.refreshCards(() => {});
	}, cardCashInterval);
});
