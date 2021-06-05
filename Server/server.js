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
var errorHandler = require('errorhandler');
const {max} = require("moment");

app.use(upload());
app.use(express.static("Data"));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
	if(err)
		return res.send({status: 100, message: "error parsing json"});
});

app.use(function (req, res, next) {

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	next();

});

app.get("/", function (req, res) {
	try {
		return res.send("WaifuCollector");
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/cards", function (req, res) {
	try {
		database.getCards((cards) => {
			if (cards != undefined) return res.send({status: 1, cards: cards});

			return res.send({status: 0});
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

			return res.send(fileContent);
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/cards/import", function (req, res) {
	try {
		if (!req.files || !req.files.cardCSV) return res.send({status: 0, message: "No file uploaded!"});

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

app.post("/card/give", async (req, res) => {
	try {
		let userID = parseInt(req.body.userID);
		let cardID = parseInt(req.body.cardID);
		let quality = parseInt(req.body.quality);
		let level = parseInt(req.body.level);
		let frame = parseInt(req.body.frame);

		if( isNaN(userID) ||
			isNaN(cardID) ||
			isNaN(quality) ||
			isNaN(level) ||
			isNaN(frame)
		) return res.send({status: 1, message: "wrong data"});

		let decoded = await logic.standardroutine(req.body.token, res);

		database.getUserRank(decoded.id, (rank) => {
			if (rank != 1) return res.send({status: 1, message: "missing permission"});

			database.addCard(userID, cardID, quality, level, frame, (id) => {
				res.send({status: 0, uuid: id});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
})

/*
app.get("/card/:cardID/", function (req, res) {
	try {
		database.getCard(.cardID, (card) => {
			if (card != undefined) {
				res.send({status: 1, card: card});
			} else {
				res.send({status: 0});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});
*/
/*
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
*/

app.get("/display/card/:cardID/", function (req, res) {
	try {
		database.getCardDisplay(req.params.cardID, (card) => {
			if (card != undefined) return res.send({status: 1, card: card});
			return res.send({status: 0});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/display/cards", function (req, res) {
	try {
		database.getCardsDisplay((cards) => {
			if (cards != undefined) return res.send({status: 1, cards: cards});
			return res.send({status: 0});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/animes", function (req, res) {
	try {
		database.getAnimes((animes) => {
			if (animes != undefined) return res.send({status: 1, animes: animes});
			return res.send({status: 0});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/usersall", function (req, res) {
	try {
		database.getUsersAll((users) => {
			if (users != undefined) return res.send({status: 1, users: users});
			return res.send({status: 0});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/:id/rank", function (req, res) {
	try {
		var userID = req.params.id;

		if (userID === undefined)
			return res.send({
				status: 1,
				message: "Missing userID",
			});

		database.getUserRank(userID, (rankID) => {
			if (rankID != undefined)
				return res.send({
					status: 0,
					rankID: rankID,
				});
			return res.send({
				status: 1,
				message: "RankID not found",
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/log", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		database.getUserRank(decoded.id, (rank) => {
			if (rank != 1) return res.send({status: 1, message: "You dont have permission to view this"});

			logger.read((data) => {
				return res.send({status: 0, log: data});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/notifications", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		database.getNotifications(decoded.id, (result) => {
			return res.send({status: 0, data: result});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/login", async (req, res) => {
	try {
		var username = req.body.username;
		var password = req.body.password;

		if(username == undefined || password == undefined)
			return res.send({status: 1, message: "no username or password"});

		if(!utils.isString(username) || !utils.isString(password))
			return res.send({status: 1, message: "wrong datatype"});

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
					"username length must be between " +
					logic.getUserLen()[0] +
					" and " +
					logic.getUserLen()[1]
				);
				return;
			}
			case 2: {
				registerCallback(
					false,
					"user can only contain letters, numbers and _"
				);
				return;
			}
		}

		switch (logic.checkPass(password)) {
			case 1: {
				registerCallback(
					false,
					"password length must be between " +
					logic.getPassLen()[0] +
					" and " +
					logic.getPassLen()[1]
				);
				return;
			}
		}

		if (!logic.checkMail(mail)) return res.send({status: 1, message: "invalid mail"});

		database.mailExists(mail, (b) => {
			if (b) return res.send({status: 2, message: "mail already in use"});
			database.register(username, password, mail, registerCallback);
		});

		function registerCallback(b, message) {
			if (!b) return res.send({status: 3, message: message});

			database.getUserID(username, (userID) => {
				database.setMail(userID, mail, () => {
					logic.sendVerification(userID, mail, () => {
						return res.send({status: 0});
					});
				})
			});
		}
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/user/:id", async (req, res) => {

	try {

		/*
		
		await createCache(decoded.id, decoded.username, res);
		
		*/

		let userID = req.params.id;

		if (!userID)
			return;

		if (!(logic.getClients()[userID] && logic.getClients()[userID].username))
			await createCache(userID, undefined, res);

		username = logic.getClients()[userID].username;

		if (!username || username == "null" || username == null)
			return res.send({
				status: 1,
				message: "User with userID " + userID + " not found!",
			});

		return res.send({
			status: 0,
			username: username
		});

	} catch (ex) {

		logic.handleException(ex, res);

	}

});

app.get("/user/:id/badges", async (req, res) => {

	try {

		let userID = req.params.id;

		if (!userID)
			return;

		if (!(logic.getClients()[userID] && logic.getClients()[userID].username))
			await createCache(userID, undefined, res);

		username = logic.getClients()[userID].username;

		if (!username || username == "null" || username == null)
			return res.send({
				status: 1,
				message: "User with userID " + userID + " not found!",
			});

		//PLACEHOLDER (obv.)
		const badges = logic.getBadges(username);

		return res.send({
			status: 0,
			badges: badges
		});

	} catch (ex) {

		logic.handleException(ex, res);

	}

});

app.get("/user/:id/stats", async (req, res) => {

	try {

		let userID = req.params.id;

		if (!userID)
			return;

		if (!(logic.getClients()[userID] && logic.getClients()[userID].username))
			await createCache(userID, undefined, res);

		username = logic.getClients()[userID].username;

		if (!username || username == "null" || username == null)
			return res.send({
				status: 1,
				message: "User with userID " + userID + " not found!",
			});

		let friends = 0;

		logic.getClients()[userID].getFriends().forEach(friend => {

			if (friend.friend_status == 2)
				friends++;
		});

		let maxFriends = logic.getFriendLimit();

		let cards = logic.getClients()[userID].getCardTypeAmount();
		let maxCards = await database.getCardAmount(); //cache.getCardAmount();

		let trades = logic.getTradeCooldownMax() - logic.getClients()[userID].getTradeCooldownCount();
		let maxTrades = logic.getTradeCooldownMax();

		return res.send({

			status: 0,

			maxFriends: maxFriends,
			friends: friends,

			maxCards: maxCards,
			cards: cards,

			maxTrades: maxTrades,
			trades: trades

		});

	} catch (ex) {

		logic.handleException(ex, res);

	}

});

app.post("/getDashboard", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);

		//username
		username = logic.getClients()[decoded.id].username;

		if (!username || username == "null" || username == null)
			return res.send({
				status: 1,
				message: "User with userID " + decoded.id + " not found!",
			});

		//friends
		var friendcount = logic.getClients()[decoded.id].getFriends().length;
		var maxfriendcount = logic.getFriendLimit();

		//cardAmount
		var cardCount = logic.getClients()[decoded.id].getCardTypeAmount();
		var cardMax = cache.getCardAmount();

		//packtime
		return res.send({
			status: 0,
			packTime: logic.getPackTime(decoded.id),
			fullTime: logic.getPackCooldown() * 1000,
			packTimeAnime: logic.getAnimePackTime(decoded.id),
			fullTimeAnime: logic.getAnimePackCooldown(decoded.id),
			cardCount: cardCount,
			cardMax: cardMax,
			name: username,
			friendcount: friendcount,
			maxfriendcount: maxfriendcount,
			tradeCooldownCount: logic.getClients()[decoded.id].getTradeCooldownCount(),
			tradeCooldownMax: logic.getTradeCooldownMax(),
			tradesAvailavble: logic.getTradeCooldownMax() - logic.getClients()[decoded.id].getTradeCooldownCount(),
			tradesAvailavbleMax: logic.getTradeCooldownMax(),
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/packTime", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		return res.send({status: 0, packTime: logic.getPackTime(decoded.id)});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/packTimeMax", async (req, res) => {
	try {
		return res.send({status: 0, packTimeMax: logic.getPackCooldown() * 1000});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/pack", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		var nowDate = moment();
		var date = moment(nowDate).add(logic.getPackCooldown(), "seconds");
		var packDate = moment(parseInt(logic.getClients()[decoded.id].packTime));

		if (!nowDate.isAfter(packDate)) return res.send({status: 1, message: "Wait"});

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
					cards[j]
					, (insertID) => {
						cards[j].id = insertID;
						if (j == cards.length - 1)
							return res.send({status: 0, packTime: "0", message: "OK", cards: cards});

						addToDB(j + 1);
					}
				);
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/passchange", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		var username = decoded.username;
		var newpassword = req.body.newpassword;

		if(!utils.isString(username) || !utils.isString(newpassword))
			return res.send({status: 1, message: "wrong data"});

		switch (logic.checkPass(newpassword)) {
			case 1: {
				return res.send({
					status: 1,
					message:
						"the password length must be between " +
						logic.getPassLen()[0] +
						" and " +
						logic.getPassLen()[1],
				});
			}
		}
		database.userexists(username, (b) => {
			logger.write(decoded.username + " Changed Password");
			if (b) {
				database.changePass(username, newpassword);
				return res.send({status: 0, message: "Password changed"});
			}

			return res.send({status: 1, message: "Failed"});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

/*
app.post("/inventory", async (req, res) => {
	//let start = moment();
	try {
		var page = req.body.page;
		var search = req.body.search;
		var next = req.body.next;
		var sortType = parseInt(req.body.sortType);
		var exuuid = parseInt(req.body.exclude);
		var onlyid = parseInt(req.body.id);
		var level = parseInt(req.body.level);

		var friendID = parseInt(req.body.userID);
		var friend = req.body.friend == undefined ? false : true;

		var exclude = [];

		if (next == undefined) next = -1;
		if (page == undefined) page = 0;
		if (search == undefined) search = "";
		if (isNaN(exuuid)) exuuid = undefined;
		else exclude.push(exuuid);
		if (isNaN(level)) level = undefined;
		if (isNaN(onlyid)) onlyid = undefined;
		if (isNaN(sortType)) sortType = undefined;
		if (isNaN(friendID)) friendID = undefined;


		var decoded = await logic.standardroutine(req.body.token, res);

		if (friend) await logic.createCache(friendID, undefined, res);
		var userID = decoded.id;

		if (friend && !logic.getClients()[userID].hasFriendAdded(friendID)) {
			res.send({status: 1, message: "Not your friend"});
			return;
		}

		var ids = undefined;
		if (onlyid === undefined) {
			ids = logic.getClients()[decoded.id].lastids;
			if (logic.getClients()[decoded.id].lastsearch != search || (page === 0 && next === -1)) {
				logic.getClients()[decoded.id].lastsearch = search;
				ids = cache.getIdsByString(search);
			}
		} else {
			ids = [onlyid];
		}

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
			//console.log("1: " + (moment() - start));
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
					level,
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
			//console.log("2: " + (moment() - start));
			logic.getCards(inventory, () => {
				//console.log("3: " + (moment() - start));
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
*/

app.get("/card/:uuid", async (req, res) => {
	try {
		var uuid = parseInt(req.params.uuid);
		if (isNaN(uuid)) return res.send({status: 1, message: "Invalid data"});

		const card = await logic.getCard(uuid);
		if (card === undefined) return res.send({status: 1, message: "Card not found"})
		return res.send({status: 0, card: card});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/upgrade", async (req, res) => {
	try {
		var carduuid = parseInt(req.body.carduuid);
		var mainuuid = parseInt(req.body.mainuuid);

		if (isNaN(carduuid) || isNaN(mainuuid))
			return res.send({status: 1, message: "Invalid data"});

		var decoded = await logic.standardroutine(req.body.token, res);

		if (mainuuid == carduuid)
			return res.send({
				status: 1,
				message: "Cant upgrade itself",
			});

		let maincard = await logic.getCardUUID(mainuuid, decoded.id);
		if (maincard == undefined)
			return res.send({
				status: 1,
				message: "Cant find card, or it isnt yours",
			});

		let card = await logic.getCardUUID(carduuid, decoded.id);
		if (card == undefined)
			return res.send({
				status: 1,
				message: "Cant find card, or it isnt yours",
			});

		if (card.card.id != maincard.card.id || card.level != maincard.level)
			return res.send({
				status: 1,
				message: "Cant upgrade these cards",
			});

		var chance = (card.quality + maincard.quality) * 10;

		var success = true;
		var r = utils.getRandomInt(0, 100);
		if (r > chance) success = false;

		logger.write(decoded.username + " Upgrade lvl:" + card.level + (success ? " Succeded" : " Failed"));

		var newlevel = 0;
		var newquality = 0;
		if (success) {
			newlevel = card.level + 1;
			newquality = utils.getRandomInt(logic.getQualityRange()[0], logic.getQualityRange()[1]);
		} else {
			newlevel = card.level;
			newquality = Math.round(
				(card.quality + maincard.quality) / 2
			) + 1;
			if (newquality > logic.getQualityRange()[1]) newquality = logic.getQualityRange()[1];
		}

		card.level = newlevel;
		card.quality = newquality;
		card.frame.id = maincard.frame.id;

		logic.getClients()[decoded.id].deleteCard(carduuid);
		logic.getClients()[decoded.id].deleteCard(mainuuid);
		database.deleteCard(carduuid, () => {
			database.deleteCard(mainuuid, () => {
				logic.removeTrade(carduuid, mainuuid, () => {
					logic.addCardToUser(
						decoded.id,
						card,
						(insertID) => {
							return res.send(
								{
									status: 0,
									uuid: insertID,
									success: success
								});
						}
					);
				});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/friends", async (req, res) => {
	try {

		//var decoded = await logic.standardroutine(req.body.token, res);

		let userID = req.body.id;

		if (!userID)
			return res.send({status: 1, message: "No userID set!"});

		if (!(logic.getClients()[userID] && logic.getClients()[userID].username))
			await createCache(userID, undefined, res);

		var friends = logic.getClients()[userID].getFriends();
		var data = [];
		run2(0);
		function run2(i) {
			if (i == friends.length) return res.send({status: 0, friends: data});

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
		var userID = parseInt(req.body.userID);
		var username = req.body.username;

		var decoded = await logic.standardroutine(req.body.token, res);

		if (!isNaN(userID)) {
			logic.sendFriendReqeust(decoded.id, userID, res);
			return;
		}

		if (!utils.isString(username))
			return res.send({status: 1, message: "no username or userID provided"});

		database.getUserID(username, (id) => {
			logic.sendFriendReqeust(decoded.id, id, res);
		});

	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/managefriend", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var command = parseInt(req.body.command);

		if (isNaN(userID) || isNaN(command))
			return res.send({status: 1, message: "not a userID"});

		if (command != 0 && command != 1)
			return res.send({status: 1, message: "wrong data"});

		var decoded = await logic.standardroutine(req.body.token, res);

		if (command == 0) {
			if (!logic.getClients()[decoded.id].acceptFriendRequest(userID))
				return res.send({status: 1, message: "user not found"});

			if (logic.getClients()[userID] != undefined)
				logic.getClients()[userID].friendRequestAccepted(decoded.id);
			database.acceptFriendRequest(userID, decoded.id, () => {
				database.addNotification(
					decoded.id,
					`${logic.getClients()[userID].username} accepted your friendrequest!`,
					"You friend request got accepted, click to view!",
					"dashboard",
					() => {}
				);
				return res.send({status: 0});
			});
		} else if (command == 1) {
			if (!logic.getClients()[decoded.id].deleteFriend(userID))
				return res.send({status: 1, message: "user not found"});

			if (logic.getClients()[userID] != undefined)
				logic.getClients()[userID].deleteFriend(decoded.id);
			database.deleteFriend(userID, decoded.id, () => {
				return res.send({status: 0});
			});
		}
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/trade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);

		if (isNaN(userID)) return res.send({status: 1, message: "not a userID"});

		var decoded = await logic.standardroutine(req.body.token, res);

		if (!logic.getClients()[decoded.id].hasFriendAdded(userID))
			return res.send({status: 1, message: "not your friend"});

		await logic.createCache(userID, undefined, res);

		let tradeok = 0;
		let tradeokother = 0;
		let tm = await database.getTradeManager(decoded.id, userID);
		if (tm != undefined) {
			if (tm[0].userone == decoded.id) {
				tradeok = tm[0].statusone;
				tradeokother = tm[0].statustwo;
			} else {
				tradeok = tm[0].statustwo;
				tradeokother = tm[0].statusone;
			}
		}

		let cards = await database.getTrade(decoded.id, userID);
		logic.formatCards(cards);

		let cardsfriend = await database.getTrade(userID, decoded.id);
		logic.formatCards(cardsfriend);

		let cardsuggestions = await database.getTradeSuggestions(userID, decoded.id);
		logic.formatCards(cardsuggestions);

		let cardsuggestionsfriend = await database.getTradeSuggestions(decoded.id, userID);
		logic.formatCards(cardsuggestionsfriend);

		let tradeTime = logic.getClients()[decoded.id].getTradeTime(userID) - moment().valueOf();
		if (tradeTime < 0) tradeTime = 0;

		let tradeLimitReached = logic.getClients()[decoded.id].getTradeCooldownCount() >= logic.getTradeCooldownMax() || logic.getClients()[userID].getTradeCooldownCount() >= logic.getTradeCooldownMax();

		return res.send({
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
			tradeLimitReached: tradeLimitReached
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/addtrade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);

		if (isNaN(userID) || isNaN(cardID)) return res.send({status: 1, message: "not a userID"});

		var decoded = await logic.standardroutine(req.body.token, res);

		logic.addCardTrade(decoded.id, userID, cardID, (sc) => {
			if (sc.status == 0)
				database.addNotification(
					userID,
					`${logic.getClients()[decoded.id].username} changed the Trade`,
					"The trade got changed, click to view!",
					`trade/${decoded.id}`,
					() => {}
				);
			return res.send(sc);
		});
		return;
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/suggesttrade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);

		if (isNaN(userID) || isNaN(cardID)) return res.send({status: 1, message: "not a userID"});

		var decoded = await logic.standardroutine(req.body.token, res);

		if (!logic.getClients()[decoded.id].hasFriendAdded(userID))
			return res.send({status: 1, message: "not your friend"});

		const result = await database.getCardUUID(cardID, userID);
		if (result == undefined)
			return res.send({
				status: 1,
				message: "Cant find card, or it isnt his",
			});

		database.tradeExists(decoded.id, userID, cardID, (b) => {
			if (b)
				return res.send({status: 1, message: "Card already in trade"});

			database.tradeSuggestionExists(decoded.id, userID, cardID, (b) => {
				if (b)
					return res.send({status: 1, message: "Card Suggestion already in trade"});

				database.addTradeSuggestion(decoded.id, userID, cardID, () => {
					database.addNotification(
						userID,
						`${logic.getClients()[decoded.id].username} changed the Trade`,
						"The trade got changed, click to view!",
						`trade/${decoded.id}`,
						() => {}
					);
					return res.send({status: 0});
				});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/removetrade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);

		if (isNaN(userID) || isNaN(cardID)) return res.send({status: 1, message: "not a userID/cardID"});

		var decoded = await logic.standardroutine(req.body.token, res);

		database.removeTradeUser(cardID, decoded.id, userID, () => {
			logic.setTrade(decoded.id, userID, 0, () => {
				logic.setTrade(userID, decoded.id, 0, () => {
					database.addNotification(
						userID,
						`${logic.getClients()[decoded.id].username} changed the Trade`,
						"The trade got changed, click to view!",
						`trade/${decoded.id}`,
						() => {}
					);
					return res.send({status: 0});
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

		if (isNaN(userID) || isNaN(cardID)) return res.send({status: 1, message: "not a userID/cardID"});

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
				`${logic.getClients()[decoded.id].username} changed the Trade`,
				"The trade got changed, click to view!",
				`trade/${decoded.id}`,
				() => {}
			);
			return res.send({status: 0});
		});
		return;
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/acceptsuggestion", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);
		var cardID = parseInt(req.body.cardID);

		if (isNaN(userID) || isNaN(cardID)) return res.send({status: 1, message: "not a userID/cardID"});

		var decoded = await logic.standardroutine(req.body.token, res);

		logic.addCardTrade(decoded.id, userID, cardID, (sc) => {
			if (sc.status == 0)
				database.addNotification(
					userID,
					`${logic.getClients()[decoded.id].username} changed the Trade`,
					"The trade got changed, click to view!",
					`trade/${decoded.id}`,
					() => {}
				);
			return res.send(sc);
		});
		return;
	} catch (ex) {logic.handleException(ex, res);}
});


app.post("/okTrade", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);

		if (isNaN(userID)) return res.send({status: 1, message: "not a userID"});

		var decoded = await logic.standardroutine(req.body.token, res);

		await logic.createCache(userID, undefined, res);

		var nowDate = moment();
		var date = moment(nowDate).add(logic.getTradeCooldown(), "seconds");
		var tradeDate = moment(parseInt(logic.getClients()[decoded.id].getTradeTime(userID)));

		if (tradeDate.isValid() && !nowDate.isAfter(tradeDate)) return res.send({status: 1, message: "Wait"});

		if (logic.getClients()[decoded.id].getTradeCooldownCount() >= logic.getTradeCooldownMax() ||
			logic.getClients()[userID].getTradeCooldownCount() >= logic.getTradeCooldownMax())
			return res.send({status: 1, message: "TradeLimit reached"});

		logic.setTrade(decoded.id, userID, 1, async () => {
			let tm = await database.getTradeManager(decoded.id, userID);
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
									`${logic.getClients()[decoded.id].username} completed the Trade`,
									"The trade got completed, click to view!",
									`trade/${decoded.id}`,
									() => {}
								);
								logic.getClients()[decoded.id].setTradeTime(userID, date.valueOf());
								logic.getClients()[userID].setTradeTime(decoded.id, date.valueOf());
								return res.send({status: 0});
							});
						});
					});
				});
				async function transfer(userone, usertwo, callback) {
					let cards = await logic.getTrade(userone, usertwo);
					let suggestions = await logic.getTradeSuggestions(userone, usertwo);
					for (var i = 0; i < cards.length; i++) {
						logic.addCardToUserCache(
							usertwo,
							cards[i].id,
							cards[i].card.id,
							cards[i].quality,
							cards[i].level,
							cards[i].frame.id,
						);
						logic.removeCardFromUserCache(usertwo, cards[i].id);
					}
					run2(0);
					function run2(idx) {
						if (idx == cards.length) {
							run3(0);
							return;
						}
						database.removeTrade(cards[idx].id, () => {
							database.changeCardUser(cards[idx].id, usertwo, () => {
								run2(idx + 1);
							});
						});
					}
					function run3(idx) {
						if (idx == suggestions.length) {
							callback();
							return;
						}
						database.removeSuggestion(suggestions[idx].id, () => {
							run3(idx + 1);
						});
					}
				}
			} else {
				database.addNotification(
					userID,
					`${logic.getClients()[decoded.id].username} changed the Trade`,
					"The trade got changed, click to view!",
					`trade/${decoded.id}`,
					() => {}
				);
				return res.send({status: 0});
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/tradeTime", async (req, res) => {
	try {
		var userID = parseInt(req.body.userID);

		var decoded = await logic.standardroutine(req.body.token, res);
		//if (isNaN(userID)) userID = decoded.id;
		if (isNaN(userID)) return res.send({status: 1, message: "No userID provided"});

		await logic.createCache(userID, undefined, res);

		var tradeTime = logic.getClients()[decoded.id].getTradeTime(userID) - moment().valueOf();
		if (tradeTime < 0) tradeTime = 0;
		return res.send({status: 0, tradeTime: tradeTime});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/deleteNotification", async (req, res) => {
	try {
		var notificationID = parseInt(req.body.notificationID);

		if (isNaN(notificationID)) return res.send({status: 1, message: "not a notificationID"});

		var decoded = await logic.standardroutine(req.body.token, res);

		database.removeNotification(notificationID, decoded.id, () => {
			return res.send({status: 0});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/deleteAllNotifications", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);

		database.removeNotifications(decoded.id, () => {
			return res.send({status: 0});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/packData", (req, res) => {
	try {
		return res.send({status: 0, packData: cache.getPackData()});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/verified", async (req, res) => {
	try {
		try {
			var decoded = jwt.verify(req.query.token, logic.getJWTSecret());
		} catch (JsonWebTokenError) {
			return res.send({status: 1, message: "Identification Please"});
		}

		database.getMailVerified(decoded.id, (mv) => {
			var verified = 0;
			if (mv.verified == 0) verified = 1;
			if (mv.email.length == 0) verified = 2;
			return res.send({status: 0, verified: verified, mail: mv.email});
		});

	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/setmail", async (req, res) => {
	try {
		var mail = req.body.mail;
		if (mail == undefined || !utils.isString(mail))
			return res.send({status: 1, message: "Invalid input"});

		mail = mail.trim();

		try {
			var decoded = jwt.verify(req.body.token, logic.getJWTSecret());
		} catch (JsonWebTokenError) {
			return res.send({status: 1, message: "Identification Please"});
		}

		if (!logic.checkMail(mail)) return res.send({status: 1, message: "Invalid mail"});

		database.getMailVerified(decoded.id, (mv) => {
			if (mv.verified) return res.send({status: 3, message: "Already Verified"});

			database.mailExists(mail, (b) => {
				if (b) return res.send({status: 2, message: "Mail already in use"});

				database.deleteVerificationKey(decoded.id, () => {
					if (logic.getClients()[decoded.id]) {
						logic.getClients()[decoded.id].mail = mail;
					}

					database.setMail(decoded.id, mail, () => {
						logic.sendVerification(decoded.id, mail, () => {
							return res.send({status: 0});
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
			return res.send({status: 1, message: "Identification Please"});
		}

		database.getMailVerified(decoded.id, (mv) => {
			if (mv.verified) return res.send({status: 3, message: "Already Verified"});

			if (logic.getClients()[decoded.id]) {
				logic.getClients()[decoded.id].mail = "";
			}

			database.setMail(decoded.id, "", () => {
				return res.send({status: 0});
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
			return res.send({status: 1, message: "Identification Please"});
		}

		database.getMailVerified(decoded.id, (mv) => {
			if (mv.verified) return res.send({status: 3, message: "Already Verified"});

			logic.verifyMail(decoded.id, key, res);
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/mail", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);

		database.getMailVerified(decoded.id, (mv) => {
			res.send({status: 0, mail: mv.email});
		})

	} catch (ex) {logic.handleException(ex, res);}
})

app.post("/verify/resend", async (req, res) => {
	try {
		try {
			var decoded = jwt.verify(req.body.token, logic.getJWTSecret());
		} catch (JsonWebTokenError) {
			return res.send({status: 1, message: "Identification Please"});
		}

		database.getMailVerified(decoded.id, (mv) => {

			if (mv.email == "") return res.send({status: 1});

			logic.sendVerification(decoded.id, mv.email, () => {
				return res.send({status: 0});
			});
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.post("/animePack", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);

		var nowDate = moment();
		var date = moment(nowDate).add(logic.getAnimePackCooldown(), "seconds");
		var packDate = moment(parseInt(logic.getClients()[decoded.id].animePackTime));

		if (!nowDate.isAfter(packDate)) return res.send({status: 1, message: "Wait"});

		var packdatadate = nowDate.valueOf() - (nowDate.valueOf() % logic.getPackDateSpan()) + logic.getPackDateSpan();
		database.addPackData(packdatadate);
		cache.addPackData(packdatadate);

		logic.getClients()[decoded.id].animePackTime = date.valueOf();
		var cardamount = utils.getRandomInt(logic.getAnimePackSize()[0], logic.getAnimePackSize()[1]);

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
						if (j == cards.length - 1)
							return res.send({status: 0, packTime: "0", message: "OK", cards: cards});
						addToDB(j + 1);
					}
				);
			}
		});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/animePackTime", async (req, res) => {
	try {
		var decoded = await logic.standardroutine(req.body.token, res);
		return res.send({status: 0, packTime: logic.getAnimePackTime(decoded.id)});
	} catch (ex) {logic.handleException(ex, res);}
});

app.get("/users", async (req, res) => {
	try {
		let username = req.query.username;
		if (!utils.isString(username)) return res.send({status: 1, message: "no string"});
		let count = 5;
		let page = parseInt(req.query.page) * count;
		if (isNaN(page)) return res.send({status: 1, message: "page has to be a int"});

		database.getUsers(username, count, page, (users) => {
			for (let i = 0; i < users.length; i++) {
				const badges = logic.getBadges(users[i].username);
				users[i].badges = badges;
			}
			return res.send({status: 0, users: users});
		})
	} catch (ex) {console.log(ex); logic.handleException(ex, res);}
});

app.get("/flex", async (req, res) => {
	try {
		let userID = parseInt(req.query.userID);

		if (isNaN(userID))
			return res.send({status: 1, message: "invalid userID"});

		const result = await logic.inventory(userID, "", 9, 0, 1);
		return res.send({status: 0, cards: result});

	} catch (ex) {console.log(ex); logic.handleException(ex, res);}
});

app.get("/inventory", async (req, res) => {
	try {
		let excludeuuids = [];

		let userID = parseInt(req.query.userID);
		let page = parseInt(req.query.page);
		let sortType = parseInt(req.query.sortType);
		let search = req.query.search;
		let level = parseInt(req.query.level);
		let cardID = parseInt(req.query.cardID);
		let excludeuuid = parseInt(req.query.excludeuuid);
		let friendID = parseInt(req.query.friendID);
		let excludeSuggestions = req.query.excludeSuggestions === "true";

		if (!utils.isString(search)) search = "";
		if (isNaN(page)) page = 0;
		if (isNaN(sortType)) sortType = 0;
		if (isNaN(level)) level = undefined;
		if (isNaN(cardID)) cardID = undefined;
		if (isNaN(excludeuuid)) excludeuuid = undefined;
		else excludeuuids.push(excludeuuid);

		if (isNaN(userID)) return res.send({status: 1, message: "invalid userID"});

		if (!isNaN(friendID)) {
			let uuids = await database.getTradeUUIDs(userID, friendID);
			for (let i = 0; i < uuids.length; i++)
				excludeuuids.push(uuids[i].uuid);
		}

		if (excludeSuggestions === true) {
			let uuids = await database.getTradeSuggestionUUIDs(friendID, userID);
			for (let i = 0; i < uuids.length; i++)
				excludeuuids.push(uuids[i].uuid);
		}

		const result = await logic.inventory(userID, search, -1, page, sortType, level, cardID, excludeuuids);
		return res.send({status: 0, cards: result});

	} catch (ex) {console.log(ex); logic.handleException(ex, res);}
});

process.on('uncaughtException', function (exception) {
	console.log(exception);
});

app.use(function (err, req, res, next) {
	console.log(err.stack)
	res.status(500).send('Internal error!')
});

console.log("Initializing DataBase");
logger.init(logic.getLogfile());
database.init(() => {
	//cache.refreshCards(() => {
	cache.loadPackData(logic.getPackDateSpan(), logic.getPackDateSendSpan(), () => {
		var server = app.listen(logic.getPort());
		//var server = https.createServer(options, app).listen(port);
		console.log("Started on port %s", logic.getPort());
	});
	//});
	//setInterval(() => {
	//cache.refreshCards(() => {});
	//}, logic.getCardCacheInterval());
});
