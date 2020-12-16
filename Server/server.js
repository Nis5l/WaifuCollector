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

app.use(express.static("Data"));
const imageBase = "Card/";
const frameBase = "Frame/";

const config = require("./config.json");

const port = config.port;

const userLen = [4, 20];
const userRegex = /^[a-zA-Z0-9_]+$/;
const passLen = [8, 30];
const packSize = [1, 1];
const passRegex = /^[a-zA-Z0-9_.]+$/;
const inventorySendAmount = config.inventorySendAmount;
const friendLimit = config.friendLimit;

var clients = {};

var cacheTime = 10000;
var packCooldown = config.packCooldown;
var qualityrange = [1, 7];
var cardCashInterval = 3600000;
//var cardCashInterval = 10000;

app.use(bodyParser.json());

app.get("/", function (req, res) {
	res.send("WaifuCollector");
});

app.post("/login", (req, res) => {
	try {
		var username = req.body.username;
		var password = req.body.password;
		//console.log("Login " + username + " " + password);
		database.login(username, password, (b, messageV, userIDV) => {
			database.getUserRank(userIDV, (rank) => {
				console.log(rank);
			});
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
		res.send({ status: 0, message: "internal server error" });
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
		res.send({ status: 0, message: "internal server error" });
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
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
		return;
	}
});

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
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
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
		res.send({ status: 0, message: "internal server error" });
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
		res.send({ status: 0, message: "internal server error" });
		return;
	}
});

app.post("/inventory", (req, res) => {
	try {
		var tokenV = req.body.token;
		var page = req.body.page;
		var search = req.body.search;
		var next = req.body.next;

		var friendID = req.body.userID;
		var friendID = parseInt(friendID);

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
			clients[decoded.id].refresh();
			run(decoded.id);
		}
		function run(userID) {
			var ids = cache.getIdsByString(search);
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
						exclude
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
		res.send({ status: 0, message: "internal server error" });
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
			clients[decoded.id].refresh();
			run();
		}
		function run() {
			getCardRequestData(decoded.id, uuid, next, page, (data) => {
				res.send(data);
			});
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
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

					clients[decoded.id].deleteCard(carduuid);
					clients[decoded.id].deleteCard(mainuuid);
					database.deleteCard(carduuid, () => {
						database.deleteCard(mainuuid, () => {
							database.getTradesCard(carduuid, (ts) => {
								if (ts != undefined) {
									run2(0);
									function run2(iter) {
										if (iter == ts.length) {
											run3();
											return;
										}
										setTrade(ts[iter].userone, ts[iter].usertwo, 0, () => {
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
												setTrade(
													ts2[iter].userone,
													ts2[iter].usertwo,
													0,
													() => {
														run4(iter + 1);
													}
												);
											}
										} else {
											run5();
										}
									});
									function run5() {
										database.removeTrade(mainuuid, () => {
											database.removeTrade(carduuid, () => {
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
								}
							});
						});
					});
				});
			});
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
		return;
	}
});

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
		res.send({ status: 0, message: "internal server error" });
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

				clients[decoded.id].addFriendRequest(id);
				database.addFriendRequest(decoded.id, id, () => {
					res.send({ status: 0 });
					return;
				});
			});
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
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
				database.acceptFriendRequest(userID, decoded.id, () => {
					res.send({ status: 0 });
					return;
				});
			} else if (command == 1) {
				if (!clients[decoded.id].deleteFriend(userID)) {
					res.send({ status: 1, message: "user not found" });
					return;
				}
				database.deleteFriend(userID, decoded.id, () => {
					res.send({ status: 0 });
					return;
				});
			}
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
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
		res.send({ status: 0, message: "internal server error" });
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
								res.send({ status: 0 });
							});
						});
					});
				});
			});

			return;
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
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
						res.send({ status: 0 });
					});
				});
			});
			return;
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
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
										id: cards[i],
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
						res.send({ status: 0 });
						return;
					}
				});
			});
		}
	} catch (e) {
		console.log(e);
		res.send({ status: 0, message: "internal server error" });
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
