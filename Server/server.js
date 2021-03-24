const express = require("express");
const bodyParser = require("body-parser");
const database = require("./database");
const app = express();
const jwt = require("jsonwebtoken");
require("datejs");
const cache = require("./serverCache");
const moment = require("moment");
const utils = require("./utils");
const logger = require("./logger");
const mail = require("./mail")
const logic = require("./logic");
const upload = require("express-fileupload");
const csv = require("csv-string");
const {createCache} = require("./logic");

app.use(upload());
app.use(express.static("Data"));
app.use(bodyParser.json());

app.get("/", function (req, res) {
	try {
		res.send("WaifuCollector");
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/cards", function (req, res) {
	try {
		database.getCards((cards) => {
			if (cards != undefined) {
				res.send({status: 1, cards: cards});
			} else {
				res.send({status: 0});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/cards/export", function (req, res) {
	try {
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
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/cards/import", function (req, res) {
	try {
		if (!req.files || !req.files.cardCSV) {
			res.send({status: 0, message: "No file uploaded!"});
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
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/card/:cardID/", function (req, res) {
	try {
		database.getCard(req.params.cardID, (card) => {
			if (card != undefined) {
				res.send({status: 1, card: card});
			} else {
				res.send({status: 0});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/card/:cardID/update", function (req, res) {
	try {
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
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/display/card/:cardID/", function (req, res) {
	try {
		database.getCardDisplay(req.params.cardID, (card) => {
			if (card != undefined) {
				res.send({status: 1, card: card});
			} else {
				res.send({status: 0});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/display/cards", function (req, res) {
	try {
		database.getCardsDisplay((cards) => {
			if (cards != undefined) {
				res.send({status: 1, cards: cards});
			} else {
				res.send({status: 0});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/animes", function (req, res) {
	try {
		database.getAnimes((animes) => {
			if (animes != undefined) {
				res.send({status: 1, animes: animes});
			} else {
				res.send({status: 0});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/users", function (req, res) {
	try {
		database.getUsers((users) => {
			if (users != undefined) {
				res.send({status: 1, users: users});
			} else {
				res.send({status: 0});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/:id/rank", function (req, res) {
	try {
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
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/log", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		database.getUserRank(decoded.id, (rank) => {
			if (rank != 1) {
				res.send({status: 1, message: "You dont have permission to view this"});
			}
			logger.read((data) => {
				res.send({status: 0, log: data});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/notifications", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		database.getNotifications(decoded.id, (result) => {
			res.send({status: 0, data: result});
			return;
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/login", async (req, res) => {
	try {
		var username = req.body.username;
		var password = req.body.password;
		logger.write("Login " + username);
		database.login(username, password, async (b, messageV, userIDV) => {
			var tokenV = "";
			if (b) tokenV = jwt.sign({username: username, id: userIDV}, logic.getJWTSecret(), {expiresIn: 30 * 24 * 60 * 60});

			if (b)
				res.send({
					status: b ? 0 : 1,
					token: tokenV,
					userID: userIDV,
					message: messageV,
				});
			else res.send({status: b ? 0 : 1, token: tokenV, message: messageV});

			if (b) await logic.createCache(userIDV, username, res);
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/register", (req, res) => {
	try {
		var username = req.body.username;
		var password = req.body.password;
		var mail = req.body.mail;

		logger.write("Register " + username);
		switch (logic.checkUser(username)) {
			case 1: {
				registerCallback(
					false,
					"the username length must be between " +
					logic.getUserLen()[0] +
					" and " +
					logic.getUserLen()[1]
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

		switch (logic.checkPass(password)) {
			case 1: {
				registerCallback(
					false,
					"the password length must be between " +
					logic.getPassLen()[0] +
					" and " +
					logic.getPassLen()[1]
				);
				return;
			}
		}

		if (!logic.checkMail(mail)) {
			res.send({status: 1, message: "Invalid mail"});
			return;
		}

		database.mailExists(mail, (b) => {
			if (b) {
				res.send({status: 2, message: "Mail already in use"});
				return;
			}
			database.register(username, password, registerCallback);
		});

		function registerCallback(b, message) {
			if (!b) {
				res.send({status: 3, message: message});
				return;
			}
			database.getUserID(username, (userID) => {
				database.setMail(userID, mail, () => {
					logic.sendVerification(userID, mail, () => {
						res.send({status: 0});
					});
				})
			});
		}
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/getDashboard", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);

		//username
		username = logic.getClients()[decoded.id].username;

		if (!username || username == "null" || username == null) {
			res.send({
				status: 1,
				message: "User with userID " + decoded.id + " not found!",
			});
			return;
		}
		//friends
		var friendcount = logic.getClients()[decoded.id].getFriends().length;
		var maxfriendcount = logic.getFriendLimit();

		//cardAmount
		var cardCount = logic.getClients()[decoded.id].getCardTypeAmount();
		var cardMax = cache.getCardAmount();

		//packtime
		res.send({
			status: 0,
			packTime: logic.getPackTime(decoded.id),
			fullTime: logic.getPackCooldown() * 1000,
			cardCount: cardCount,
			cardMax: cardMax,
			name: username,
			friendcount: friendcount,
			maxfriendcount: maxfriendcount,
			tradesAvailavble: logic.getTradeCooldownMax() - logic.getClients()[decoded.id].getTradeCooldownCount(),
			tradesAvailavbleMax: logic.getTradeCooldownMax(),
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/packTime", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		res.send({status: 0, packTime: logic.getPackTime(decoded.id)});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/pack", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		var nowDate = moment();
		var date = moment(nowDate).add(logic.getPackCooldown(), "seconds");
		var packDate = moment(parseInt(logic.getClients()[decoded.id].packTime));

		if (
			logic.getClients()[decoded.id] == null ||
			logic.getClients()[decoded.id].packTime == "null" ||
			nowDate.isAfter(packDate) ||
			!packDate.isValid()
		) {

			var packdatadate = nowDate.valueOf() - (nowDate.valueOf() % logic.getPackDateSpan()) + logic.getPackDateSpan();
			database.addPackData(packdatadate);
			cache.addPackData(packdatadate);

			logic.getClients()[decoded.id].packTime = date.valueOf();
			var cardamount = utils.getRandomInt(logic.getPackSize()[0], logic.getPackSize()[1]);

			//(highest-level)^3 * 0.5

			logic.getRandomCards(cardamount, (cards) => {
				addToDB(0);
				function addToDB(j) {
					if (cards[j].level == 1)
						logger.write(decoded.username + " Pulled a lvl1");
					if (cards[j].level == 2)
						logger.write(decoded.username + " Pulled a lvl2");
					logic.addCardToUser(
						decoded.id,
						cards[j].card.id,
						cards[j].quality,
						cards[j].level,
						cards[j].frameID
						, (insertID) => {
							cards[j].id = insertID;
							if (j == cards.length - 1) {
								res.send({status: 0, packTime: "0", message: "OK", cards: cards});
								return;
							} else {
								addToDB(j + 1);
							}
						}
					);
				}
			});
		} else {
			res.send({
				status: 1,
				packTime: packDate.diff(nowDate).seconds(),
				message: "WAIT",
				cards: [],
			});
			return;
		}
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/passchange", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		var username = decoded.username;
		var newpassword = req.body.newpassword;
		//console.log("Passchange: " + username + " " + newpassword);
		switch (logic.checkPass(newpassword)) {
			case 1: {
				res.send({
					status: 1,
					message:
						"the password length must be between " +
						logic.getPassLen()[0] +
						" and " +
						logic.getPassLen()[1],
				});
				return;
			}
		}
		database.userexists(username, (b) => {
			logger.write(decoded.username + " Changed Password");
			if (b) {
				database.changePass(username, newpassword);
				res.send({status: 0, message: "Password changed"});
			} else {
				res.send({status: 1, message: "Failed"});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/inventory", async (req, res) => {
	try {
		var page = req.body.page;
		var search = req.body.search;
		var next = req.body.next;
		var sortType = parseInt(req.body.sortType);

		var friendID = parseInt(req.body.userID);
		var friend = req.body.friend == undefined ? false : true;

		if (next == undefined) next = -1;
		if (page == undefined) page = 0;
		if (search == undefined) search = "";
		if (isNaN(sortType)) sortType = undefined;

		var decoded = await logic.standardroutine(req.body.token, res);

		if (friend) await logic.createCache(friendID, undefined, res);
		var userID = decoded.id;

		if (friend && !logic.getClients()[userID].hasFriendAdded(friendID)) {
			res.send({status: 1, message: "Not your friend"});
			return;
		}
		var ids = logic.getClients()[decoded.id].lastids;
		if (logic.getClients()[decoded.id].lastsearch != search || (page == 0 && next != -1)) {
			logic.getClients()[decoded.id].lastsearch = search;
			ids = cache.getIdsByString(search);
		}
		var exclude = [];
		if (!isNaN(friendID)) {
			if (!friend) {
				database.getTrade(userID, friendID, (ex) => {
					for (var i = 0; ex != undefined && i < ex.length; i++) {
						exclude.push(ex[i].card);
					}
					run3();
				});
			} else {
				database.getTrade(friendID, userID, (ex) => {
					database.getTradeSuggestions(userID, friendID, (exs) => {
						for (var i = 0; ex != undefined && i < ex.length; i++) {
							exclude.push(ex[i].card);
						}
						for (var i = 0; exs != undefined && i < exs.length; i++) {
							exclude.push(exs[i].card);
						}
						run3();
					});
				});
			}
		} else {
			run3();
		}
		function run3() {
			if (friend) logic.setFriendinventory(logic.getClients()[userID], logic.getClients()[friendID]);
			if (next == 0) {
				var inventory = logic.getClients()[userID].nextPage(logic.getInventorySendAmount(), friend);
			} else if (next == 1) {
				var inventory = logic.getClients()[userID].prevPage(logic.getInventorySendAmount(), friend);
			} else
				var inventory = logic.getClients()[userID].getInventory(
					page,
					logic.getInventorySendAmount(),
					ids,
					exclude,
					undefined,
					sortType,
					friend
				);
			var pageStats = logic.getClients()[userID].getPageStats();
			if (inventory.length == 0) {
				res.send({
					status: 0,
					inventory: inventory,
					page: pageStats[0],
					pagemax: pageStats[1],
				});
				return;
			}
			logic.getCards(inventory, () => {
				res.send({
					status: 0,
					inventory: inventory,
					page: pageStats[0],
					pagemax: pageStats[1],
				});
			});
		}
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/card", async (req, res) => {
	try {
		var uuid = parseInt(req.body.uuid);
		var next = req.body.next;
		var page = req.body.page;
		var sortType = parseInt(req.body.sortType);
		if (page == undefined) page = 0;
		if (next == undefined) next = -1;
		if (isNaN(sortType)) sortType = undefined;
		if (next == -1) {
			if (uuid == undefined) {
				res.send({status: 1, message: "Invalid data"});
				return;
			}
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		logic.getCardRequestData(decoded.id, uuid, next, page, sortType, (data) => {
			res.send(data);
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/upgrade", async (req, res) => {
	try {
		var carduuid = req.body.carduuid;
		var mainuuid = req.body.mainuuid;
		if (carduuid == undefined && mainuuid == undefined) {
			res.send({status: 1, message: "Invalid data"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

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

				logger.write(decoded.username + " Upgrade lvl:" + cardresult.level + (succes ? " Succeded" : " Failed"));

				var newlevel = 0;
				var newquality = 0;
				if (succes) {
					newlevel = cardresult.level + 1;
					newquality = utils.getRandomInt(logic.getQualityRange()[0], logic.getQualityRange()[1]);
				} else {
					newlevel = cardresult.level;
					newquality = Math.round(
						(cardresult.quality + mainresult.quality) / 2
					);
				}
				logic.getClients()[decoded.id].deleteCard(carduuid);
				logic.getClients()[decoded.id].deleteCard(mainuuid);
				database.deleteCard(carduuid, () => {
					database.deleteCard(mainuuid, () => {
						logic.removeTrade(carduuid, mainuuid, () => {
							logic.addCardToUser(
								decoded.id,
								cardresult.cardID,
								newquality,
								newlevel,
								mainresult.frameID,
								(insertID) => {
									res.send({status: 0, uuid: insertID});
								}
							);
						});
					});
				});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/friends", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);

		var friends = logic.getClients()[decoded.id].getFriends();
		var data = [];
		run2(0);
		function run2(i) {
			if (i == friends.length) {
				res.send({status: 0, friends: data});
				return;
			}

			var username = undefined;
			if (logic.getClients()[friends[i].userID] != undefined) {
				username = logic.getClients()[friends[i].userID].username;
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
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/addfriend", async (req, res) => {
	try {
		var username = req.body.username;

		var decoded = await logic.standardroutine(req.body.token, res);

		database.getUserID(username, (id) => {
			if (id == undefined) {
				res.send({status: 1, message: "cant find user"});
				return;
			}
			if (id == decoded.id) {
				res.send({status: 1, message: "cant add yourself"});
				return;
			}
			if (logic.getClients()[decoded.id].hasFriend(id)) {
				res.send({status: 1, message: "already added"});
				return;
			}
			if (logic.getClients()[decoded.id].getFriends().length == logic.getFriendLimit()) {
				res.send({status: 1, message: "reached max friend count"});
				return;
			}
			if (logic.getClients()[id] != undefined) {
				if (logic.getClients()[id].hasFriend(decoded.id)) {
					res.send({status: 1, message: "already sent"});
					return;
				}
				run2();
			} else {
				database.isFriendPending(decoded.id, id, (b) => {
					if (b) {
						res.send({status: 1, message: "already sent"});
						return;
					}
					run2();
				});
			}
			function run2() {
				logic.getClients()[decoded.id].addFriendRequest(id);
				if (logic.getClients()[id] != undefined)
					logic.getClients()[id].addFriendRequestIncoming(decoded.id);
				database.addFriendRequest(decoded.id, id, () => {
					database.addNotification(
						id,
						"Friend Request",
						"You got a new friend request, click to view!",
						"friends",
						() => {}
					);
					res.send({status: 0});
					return;
				});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/managefriend", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var command = parseInt(req.body.command);

		if (isNaN(userID) || isNaN(command)) {
			res.send({status: 1, message: "not a userID"});
			return;
		}

		if (command != 0 && command != 1) {
			res.send({status: 1, message: "wrong data"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		if (command == 0) {
			if (!logic.getClients()[decoded.id].acceptFriendRequest(userID)) {
				res.send({status: 1, message: "user not found"});
				return;
			}
			if (logic.getClients()[userID] != undefined)
				logic.getClients()[userID].friendRequestAccepted(decoded.id);
			database.acceptFriendRequest(userID, decoded.id, () => {
				database.addNotification(
					decoded.id,
					"Friend Accepted",
					"You friend request got accepted, click to view!",
					"friends",
					() => {}
				);
				res.send({status: 0});
				return;
			});
		} else if (command == 1) {
			if (!logic.getClients()[decoded.id].deleteFriend(userID)) {
				res.send({status: 1, message: "user not found"});
				return;
			}
			if (logic.getClients()[userID] != undefined)
				logic.getClients()[userID].deleteFriend(decoded.id);
			database.deleteFriend(userID, decoded.id, () => {
				res.send({status: 0});
				return;
			});
		}
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/trade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);

		if (isNaN(userID)) {
			res.send({status: 1, message: "not a userID"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		if (!logic.getClients()[decoded.id].hasFriendAdded(userID)) {
			res.send({status: 1, message: "not your friend"});
			return;
		}

		await logic.createCache(userID, undefined, res);

		var tradeok = 0;
		var tradeokother = 0;
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
			var cards = [];
			var cardsfriend = [];
			var cardsuggestions = [];
			var cardsuggestionsfriend = [];
			database.getTrade(decoded.id, userID, (uuids) => {
				for (var i = 0; i < uuids.length; i++) {
					cards.push(logic.getClients()[decoded.id].getCard(uuids[i].card));
					if (cards[i] == undefined) {
						res.send({status: 1, message: "Cant find card"});
						return;
					}
				}
				database.getTrade(userID, decoded.id, (uuidsfriend) => {
					for (var i = 0; i < uuidsfriend.length; i++) {
						cardsfriend.push(logic.getClients()[userID].getCard(uuidsfriend[i].card));
						if (cardsfriend[i] == undefined) {
							res.send({status: 1, message: "Cant find card"});
							return;
						}
					}
					database.getTradeSuggestions(userID, decoded.id, (uuidseg) => {
						for (var i = 0; i < uuidseg.length; i++) {
							cardsuggestions.push(logic.getClients()[decoded.id].getCard(uuidseg[i].card));
							if (cardsuggestions[i] == undefined) {
								res.send({status: 1, message: "Cant find card"});
								return;
							}
						}
						database.getTradeSuggestions(decoded.id, userID, (uuidsegfriend) => {
							for (var i = 0; i < uuidsegfriend.length; i++) {
								cardsuggestionsfriend.push(logic.getClients()[userID].getCard(uuidsegfriend[i].card));
								if (cardsuggestionsfriend[i] == undefined) {
									res.send({status: 1, message: "Cant find card"});
									return;
								}
							}
							logic.getCards(cardsuggestions, () => {
								logic.getCards(cardsuggestionsfriend, () => {
									logic.getCards(cards, () => {
										logic.getCards(cardsfriend, () => {
											var tradeTime = logic.getClients()[decoded.id].getTradeTime(userID) - moment().valueOf();
											if (tradeTime < 0) tradeTime = 0;
											res.send({
												status: 0,
												cards: cards,
												cardsfriend: cardsfriend,
												cardsuggestions: cardsuggestions,
												cardsuggestionsfriend: cardsuggestionsfriend,
												username: logic.getClients()[userID].username,
												statusone: tradeok,
												statustwo: tradeokother,
												tradeCount1: cards.length,
												tradeCount2: cardsfriend.length,
												tradeLimit: logic.getTradeLimit(),
												tradeTime: tradeTime,
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/addtrade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);

		if (isNaN(userID) || isNaN(cardID)) {
			res.send({status: 1, message: "not a userID"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		logic.addCardTrade(decoded.id, userID, cardID, (sc) => {
			if (sc.status == 0)
				database.addNotification(
					userID,
					"Trade Changed",
					"A card got added to the trade, click to view!",
					"trade?userID=" + decoded.id,
					() => {}
				);
			res.send(sc);
		});
		return;
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/suggesttrade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);

		if (isNaN(userID) || isNaN(cardID)) {
			res.send({status: 1, message: "not a userID"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		if (!logic.getClients()[decoded.id].hasFriendAdded(userID)) {
			res.send({status: 1, message: "not your friend"});
			return;
		}
		database.getCardUUID(cardID, userID, (result) => {
			if (result == undefined) {
				res.send({
					status: 1,
					message: "Cant find card, or it isnt his",
				});
				return;
			}
			database.tradeExists(decoded.id, userID, cardID, (b) => {
				if (b) {
					res.send({status: 1, message: "Card already in trade"});
					return;
				}
				database.tradeSuggestionExists(decoded.id, userID, cardID, (b) => {
					if (b) {
						res.send({status: 1, message: "Card Suggestion already in trade"});
						return;
					}
					database.addTradeSuggestion(decoded.id, userID, cardID, () => {
						database.addNotification(
							userID,
							"Trade Suggestion",
							"A friend changed the card suggestions, click to view!",
							"trade?userID=" + decoded.id,
							() => {}
						);
						res.send({status: 0});
						return;
					});
				});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/removetrade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);

		if (isNaN(userID) || isNaN(cardID)) {
			res.send({status: 1, message: "not a userID/cardID"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		database.removeTradeUser(cardID, decoded.id, userID, () => {
			logic.setTrade(decoded.id, userID, 0, () => {
				logic.setTrade(userID, decoded.id, 0, () => {
					database.addNotification(
						userID,
						"Trade Changed",
						"A card got removed from the trade, click to view!",
						"trade?userID=" + decoded.id,
						() => {}
					);
					res.send({status: 0});
				});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/removesuggestion", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);
		var friend = req.body.friend == undefined ? false : true;

		if (isNaN(userID) || isNaN(cardID)) {
			res.send({status: 1, message: "not a userID/cardID"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		var uo = userID;
		var ut = decoded.id;
		if (friend) {
			uo = decoded.id;
			ut = userID;
		}
		database.removeSuggestionUser(uo, ut, cardID, () => {
			database.addNotification(
				userID,
				"Trade Suggestion",
				"A friend changed the card suggestions, click to view!",
				"trade?userID=" + decoded.id,
				() => {}
			);
			res.send({status: 0});
		});
		return;
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/acceptsuggestion", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);

		if (isNaN(userID) || isNaN(cardID)) {
			res.send({status: 1, message: "not a userID/cardID"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		logic.addCardTrade(decoded.id, userID, cardID, (sc) => {
			if (sc.status == 0)
				database.addNotification(
					userID,
					"Trade Suggestion",
					"A friend accepted a card suggestion, click to view!",
					"trade?userID=" + decoded.id,
					() => {}
				);
			res.send(sc);
		});
		return;
	} catch (ex) {logic.handleException(ex, res);}
});


app.post("/okTrade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);

		if (isNaN(userID)) {
			res.send({status: 1, message: "not a userID"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		await logic.createCache(userID, undefined, res);

		var nowDate = moment();
		var date = moment(nowDate).add(logic.getTradeCooldown(), "seconds");
		var tradeDate = moment(parseInt(logic.getClients()[decoded.id].getTradeTime(userID)));

		if (tradeDate.isValid() && !nowDate.isAfter(tradeDate)) {
			res.send({status: 1, message: "Wait"});
			return;
		}

		if (logic.getClients()[decoded.id].getTradeCooldownCount() >= logic.getTradeCooldownMax() ||
			logic.getClients()[userID].getTradeCooldownCount() >= logic.getTradeCooldownMax()) {
			res.send({status: 1, message: "TradeLimit reached"});
			return;
		}

		logic.setTrade(decoded.id, userID, 1, () => {
			database.getTradeManager(decoded.id, userID, (tm) => {
				if (
					tm != undefined &&
					tm[0].statusone == 1 &&
					tm[0].statustwo == 1
				) {
					transfer(decoded.id, userID, () => {
						transfer(userID, decoded.id, () => {
							logic.setTrade(decoded.id, userID, 0, () => {
								logic.setTrade(userID, decoded.id, 0, () => {
									logger.write("Traded: " + logic.getClients()[decoded.id].username + " " + logic.getClients()[userID].username);
									database.addNotification(
										userID,
										"Trade Complete",
										"A trade has been complete, click to view!",
										"trade?userID=" + decoded.id,
										() => {}
									);
									logic.getClients()[decoded.id].setTradeTime(userID, date.valueOf());
									logic.getClients()[userID].setTradeTime(decoded.id, date.valueOf());
									res.send({status: 0});
									return;
								});
							});
						});
					});
					function transfer(userone, usertwo, callback) {
						database.getTrade(userone, usertwo, (cards) => {
							database.getTradeSuggestions(userone, usertwo, (suggestions) => {
								for (var i = 0; i < cards.length; i++) {
									var c = logic.getClients()[userone].getCard(cards[i].card);
									logic.addCardToUserCache(
										usertwo,
										cards[i].card,
										c.cardID,
										c.quality,
										c.level,
										c.frameID,
									);
									logic.getClients()[userone].deleteCard(cards[i].card);
								}
								run2(0);
								function run2(idx) {
									if (idx == cards.length) {
										run3(0);
										return;
									}
									database.removeTrade(cards[idx].card, () => {
										database.changeCardUser(cards[idx].card, usertwo, () => {
											run2(idx + 1);
										});
									});
								}
								function run3(idx) {
									if (idx == suggestions.length) {
										callback();
										return;
									}
									database.removeSuggestion(suggestions[idx].card, () => {
										run3(idx + 1);
									});
								}
							});
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
					res.send({status: 0});
					return;
				}
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/tradeTime", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);

		var decoded = await logic.standardroutine(req.body.token, res);
		//if (isNaN(userID)) userID = decoded.id;
		if (isNaN(userID)) {
			res.send({status: 1, message: "No userID provided"});
			return;
		}

		await logic.createCache(userID, undefined, res);

		//if (
		//userID != decoded.id &&
		//!logic.getClients()[decoded.id].hasFriendAdded(userID)
		//) {
		//res.send({status: 1, message: "User is not your Friend"});
		//return;
		//}
		//
		var tradeTime = logic.getClients()[decoded.id].getTradeTime(userID) - moment().valueOf();
		if (tradeTime < 0) tradeTime = 0;
		res.send({status: 0, tradeTime: tradeTime});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/deleteNotification", async (req, res) => {
	try {
		var notificationID = parseInt(req.body.notificationID);

		if (isNaN(notificationID)) {
			res.send({status: 1, message: "not a notificationID"});
			return;
		}

		var decoded = await logic.standardroutine(req.body.token, res);

		database.removeNotification(notificationID, decoded.id, () => {
			res.send({status: 0});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/deleteAllNotifications", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);

		database.removeNotifications(decoded.id, () => {
			res.send({status: 0});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/packData", (req, res) => {
	try {
		res.send({status: 0, packData: cache.getPackData()});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/verified", async (req, res) => {
	try {
		try {
			var decoded = jwt.verify(req.body.token, logic.getJWTSecret());
		} catch (JsonWebTokenError) {
			res.send({status: 1, message: "Identification Please"});
			return;
		}

		database.getMailVerified(decoded.id, (mv) => {
			var verified = 0;
			if (mv.verified == 0) verified = 1;
			if (mv.email.length == 0) verified = 2;
			res.send({status: 0, verified: verified, mail: mv.email});
		});

	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/setMail", async (req, res) => {
	try {
		var mail = req.body.mail;
		if (mail == undefined || !(typeof mail === 'string' || mail instanceof String)) {
			res.send({status: 1, message: "Invalid input"});
			return;
		}
		mail = mail.trim();

		try {
			var decoded = jwt.verify(req.body.token, logic.getJWTSecret());
		} catch (JsonWebTokenError) {
			res.send({status: 1, message: "Identification Please"});
			return;
		}

		if (!logic.checkMail(mail)) {
			res.send({status: 1, message: "Invalid mail"});
			return;
		}

		database.getMailVerified(decoded.id, (mv) => {
			if (mv.verified) {
				res.send({status: 3, message: "Already Verified"});
				return;
			}
			database.mailExists(mail, (b) => {
				if (b) {
					res.send({status: 2, message: "Mail already in use"});
					return;
				}
				database.deleteVerificationKey(decoded.id, () => {
					if (logic.getClients()[decoded.id]) {
						logic.getClients()[decoded.id].mail = mail;
					}

					database.setMail(decoded.id, mail, () => {
						logic.sendVerification(decoded.id, mail, () => {
							res.send({status: 0});
						});
					})
				});
			});
		});

	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/deleteMail", async (req, res) => {
	try {
		try {
			var decoded = jwt.verify(req.body.token, logic.getJWTSecret());
		} catch (JsonWebTokenError) {
			res.send({status: 1, message: "Identification Please"});
			return;
		}

		database.getMailVerified(decoded.id, (mv) => {
			if (mv.verified) {
				res.send({status: 3, message: "Already Verified"});
				return;
			}

			if (logic.getClients()[decoded.id]) {
				logic.getClients()[decoded.id].mail = "";
			}

			database.setMail(decoded.id, "", () => {
				res.send({status: 0});
			})
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/verify", async (req, res) => {
	try {
		var key = req.body.key;

		try {
			var decoded = jwt.verify(req.body.token, logic.getJWTSecret());
		} catch (JsonWebTokenError) {
			res.send({status: 1, message: "Identification Please"});
			return;
		}

		database.getMailVerified(decoded.id, (mv) => {
			if (mv.verified) {
				res.send({status: 3, message: "Already Verified"});
				return;
			}
			logic.verifyMail(decoded.id, key, res);
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/verify/resend", async (req, res) => {
	try {
		try {
			var decoded = jwt.verify(req.body.token, logic.getJWTSecret());
		} catch (JsonWebTokenError) {
			res.send({status: 1, message: "Identification Please"});
			return;
		}

		database.getMailVerified(decoded.id, (mv) => {
			logic.sendVerification(decoded.id, mv.email, () => {
				res.send({status: 0});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

process.on('uncaughtException', function (exception) {
	console.log(exception);
});

app.use(function (err, req, res, next) {
	console.log(err.stack)
	res.status(500).send('Internal error!')
})

console.log("Initializing DataBase");
logger.init(logic.getLogfile());
database.init(() => {
	cache.refreshCards(() => {
		cache.loadPackData(logic.getPackDateSpan(), logic.getPackDateSendSpan(), () => {
			var server = app.listen(logic.getPort());
			//var server = https.createServer(options, app).listen(port);
			console.log("Started on port %s", logic.getPort());
		});
	});
	setInterval(() => {
		cache.refreshCards(() => {});
	}, logic.getCardCacheInterval());
});
