const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { cookie } = require("request");
const { render } = require("node-sass");
const https = require("https");
const fs = require("fs");
const cookieparser = require("cookie-parser");
require("./CSSManager.js");

//const options = {
//	key: fs.readFileSync("../host.key"),
//	cert: fs.readFileSync("../host.cert"),
//};
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/resources", express.static("resources"));
app.use("/assets", express.static("assets"));
app.use(cookieparser());

const config = require("./config.json");

const {
	API_HOST = config.API_HOST,
	useSSL = config.useSSL,
	port = config.port,

	SESS_NAME = "sid",
	SESS_SECRET = "jgashjdftzuasgHJFASDHgkjas",
	SESS_LIFETIME = 1000 * 60 * 60,
} = process.env;

var sess = {
	name: SESS_NAME,
	resave: false,
	saveUninitialized: false,
	secret: SESS_SECRET,
	cookie: {
		maxAge: SESS_LIFETIME,
		sameSite: true,
		secure: false,
	},
};

if (app.get("env") === "production") {
	app.set("trust proxy", 1);
	sess.cookie.secure = true;
}

app.use(session(sess));

const redirectLogin = (req, res, next) => {
	if (!req.cookies.userID) {
		res.redirect("/login");
	} else {
		next();
	}
};

const redirectDashboard = (req, res, next) => {
	if (req.cookies.userID) {
		res.redirect("/dashboard");
	} else {
		next();
	}
};

const redirectIfNotAdmin = (req, res, next) => {
	redirectLogin(req, res, () => {
		getRankID(req.cookies.userID, (rankID) => {
			if (rankID != undefined && rankID == 1) {
				next();
				return;
			}

			res.redirect("/dashboard");
		});
	});
};

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.use(renderUserView);

function getHttp() {
	return useSSL ? "https://" : "http://";
}

app.get("/", function (req, res) {
	res.render("home", { userID: req.cookies.userID });
});

app.get("/logout", redirectLogin, function (req, res) {
	req.session.destroy();
	res.clearCookie("userID");
	res.clearCookie("token");
	res.redirect("/login");
});

app.get("/login", redirectDashboard, function (req, res) {
	res.locals.message = req.query.errorMessage;
	res.render("login", {
		userID: req.cookies.userID,
		accepted: req.cookies.accepted,
	});
});

app.get("/privacy", redirectDashboard, function (req, res) {
	res.render("privacy", {
		userID: req.cookies.userID,
	});
});

app.post("/cookie", function (req, res) {
	var date = new Date();
	date.setTime(date.getTime() + 315532800000);
	res.cookie("accepted", true, { expires: date });
	res.redirect("/login");
});

app.post("/login", redirectDashboard, function (req, res) {
	const { username, password } = req.body;

	if (username && password) {
		request.post(
			getHttp() + API_HOST + "/login",
			{
				json: {
					username: username,
					password: password,
				},
				rejectUnauthorized: false,
				requestCert: false,
				agent: false,
			},
			(error, response, body) => {
				if (!error && response.statusCode == 200) {
					if (body.status == 0) {
						res.cookie("token", body.token);

						userID = body.userID;

						res.cookie("userID", userID);

						req.session.save((err) => {
							if (err) console.log(err);
						});

						res.redirect("/dashboard");
					} else {
						res.redirect(
							"/login?errorCode=" +
								body.status +
								"&errorMessage=" +
								body.message
						);
					}
				} else {
					res.redirect("/login?errorCode=3&errorMessage=Wrong response");
				}
			}
		);
	} else {
		res.redirect(
			"/login?errorCode=2&errorMessage=Username or password are empty"
		);
	}
});

app.post("/passchange", function (req, res) {
	const { password, password2 } = req.body;

	if (password && password2 && password == password2 && req.cookies.token) {
		request.post(
			getHttp() + API_HOST + "/passchange",
			{
				json: {
					token: req.cookies.token,
					newpassword: password,
				},
			},
			(error, response, body) => {
				if (!error && response.statusCode == 200) {
					if (body.status == 0) {
						res.redirect("/dashboard");
						//alert("Password Changed");
					} else
						res.redirect(
							"/settings?errorCode=2&errorMessage=password empty or dont match"
						);
				}
			}
		);
	} else {
		res.redirect(
			"/settings?errorCode=2&errorMessage=password empty or dont match"
		);
	}
});

app.get("/register", redirectDashboard, function (req, res) {
	res.locals.message = req.query.errorMessage;
	res.render("register", { userID: req.cookies.userID });
});

/*

    ERROR CODES:
        2 : username or password are null, empty or unidentified

*/

app.post("/register", redirectDashboard, function (req, res) {
	res.locals.message = req.query.errorMessage;
	const { username, password } = req.body;

	if (username && password) {
		request.post(
			getHttp() + API_HOST + "/register",
			{
				json: {
					username: username,
					password: password,
				},
				rejectUnauthorized: false,
				requestCert: false,
				agent: false,
			},
			(error, response, body) => {
				if (!error && response.statusCode == 200) {
					if (body.status == 0) {
						res.redirect("/login");
					} else {
						res.redirect(
							"/register?errorCode=" +
								body.status +
								"&errorMessage=" +
								body.message
						);
					}
				} else {
					res.redirect("/register?errorCode=3&errorMessage=Wrong response");
				}
			}
		);
	} else {
		res.redirect(
			"/register?errorCode=2&errorMessage=Username or password are empty"
		);
	}
});

app.get("/dashboard", redirectLogin, async function (req, res) {
	res.locals.message = req.query.errorMessage;
	var body = await getDashboard(req, res);
	res.render("dashboard", {
		userID: req.cookies.userID,
		dashboard: body,
	});
});

function getDashboard(req, res) {
	return new Promise((resolve, reject) => {
		request.post(
			getHttp() + API_HOST + "/getDashboard",
			{
				json: { token: req.cookies.token },
				rejectUnauthorized: false,
				requestCert: false,
				agent: false,
			},
			(error, response, body) => {
				if (error) {
					reject(error);
					return;
				}
				if (body.status == 0 || body.status == 1) {
					resolve(body);
					return;
				}
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
				return;
			}
		);
	});
}

app.post("/packTime", (req, res) => {
	request.get(
		getHttp() + API_HOST + "/packTime",
		{
			json: { token: req.cookies.token },
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.send({ packTime: body.packTime });
			} else {
				res.send({ packTime: "Error" });
			}
		}
	);
});

app.get("/adminpanel", redirectIfNotAdmin, function (req, res) {
	res.render("adminpanel/adminpanel");
});

app.get("/adminpanel/cards", redirectIfNotAdmin, function (req, response) {
	request.get(
		{
			url: getHttp() + API_HOST + "/display/cards",
		},
		function (err, res) {
			var data = JSON.parse(res.body);

			if (data.status != undefined) {
				if (data.status == 1) {
					response.render("adminpanel/adminpanel_cards", { cards: data.cards });

					return;
				}
			}

			response.redirect("/dashboard");
		}
	);
});

app.get("/adminpanel/card/:cardID/edit", redirectIfNotAdmin, async function (
	req,
	response
) {
	function jsonToArray(dataString) {
		var data = JSON.parse(dataString);

		if (data.status != undefined) {
			if (data.status == 1) {
				return data;
			}
		}

		return undefined;
	}

	var cardID = req.params.cardID;

	var cardData = jsonToArray(
		await getPageBody(getHttp() + API_HOST + "/display/card/" + cardID)
	);

	if (cardData == undefined) {
		response.redirect("/dashboard");
		return;
	}

	var card = cardData.card;
	card["image"] = getHttp() + API_HOST + "/Card/" + card["image"];

	var animeData = jsonToArray(
		await getPageBody(getHttp() + API_HOST + "/animes")
	);

	if (animeData == undefined) {
		response.render("adminpanel/adminpanel_card_edit", {
			card: card,
			animes: undefined,
		});
		return;
	}

	response.render("adminpanel/adminpanel_card_edit", {
		card: card,
		animes: animeData.animes,
	});
});

app.get("/adminpanel/anime", redirectIfNotAdmin, function (req, response) {
	request.get(
		{
			url: getHttp() + API_HOST + "/animes",
		},
		function (err, res) {
			var data = JSON.parse(res.body);

			if (data.status != undefined) {
				if (data.status == 1) {
					response.render("adminpanel/adminpanel_anime", {
						animes: data.animes,
					});

					return;
				}
			}

			response.redirect("/dashboard");
		}
	);
});

app.get("/adminpanel/users", redirectIfNotAdmin, function (req, response) {
	request.get(
		{
			url: getHttp() + API_HOST + "/users",
		},
		function (err, res) {
			var data = JSON.parse(res.body);

			if (data.status != undefined) {
				if (data.status == 1) {
					response.render("adminpanel/adminpanel_users", { users: data.users });

					return;
				}
			}

			response.redirect("/dashboard");
		}
	);
});

app.get("/settings", redirectLogin, async function (req, res) {
	res.locals.message = req.query.errorMessage;
	var dashboard = await getDashboard(req, res);
	res.render("settings", { userID: req.cookies.userID, dashboard: dashboard });
});

app.get("/pack", redirectLogin, function (req, res) {
	res.locals.message = req.query.errorMessage;
	request.post(
		getHttp() + API_HOST + "/pack",
		{
			json: { token: req.cookies.token },
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		async (error, response, body) => {
			if (!error && response.statusCode == 200) {
				if (body.packTime == "0") {
					for (var i = 0; i < body.cards.length; i++) {
						addPathCard(body.cards[i]);
					}
					var dashboard = await getDashboard(req, res);
					res.render("pack", {
						userID: req.cookies.userID,
						cards: body.cards,
						dashboard: dashboard,
					});
				} else {
					res.redirect("/dashboard?errorMessage=" + body.message);
				}
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.get("/inventory", redirectLogin, async function (req, res) {
	res.locals.message = req.query.errorMessage;
	//var page = 0;
	//var search = req.query.search;
	//var next = req.query.next;

	//getInventoryData(req.cookies.token, next, search, page, (data) => {
	//	if (data.status == 0)
	var dashboard = await getDashboard(req, res);
	res.render("inventory", {
		userID: req.cookies.userID,
		dashboard: dashboard,
	});
	//	else res.redirect("/login?errorCode=3&errorMessage=Wrong response");
	//});
});

app.post("/inventory", redirectLogin, function (req, res) {
	getInventoryData(
		req.cookies.token,
		req.body.next,
		req.body.search,
		req.body.page,
		req.body.userID,
		req.body.sortType,
		(data) => {
			if (data.status == 0)
				res.send({
					status: data.status,
					cards: data.cards,
					page: data.page,
					pagemax: data.pagemax,
				});
			else res.send({ userID: req.cookies.userID, status: 1 });
		}
	);
});

function getInventoryData(
	token,
	next,
	search,
	page,
	userID,
	sortType,
	callback
) {
	if (next == "0") next = 0;
	else if (next == "1") next = 1;
	if (next == undefined) next = 2;
	if (search == undefined) search = "";
	if (page == undefined) page = 0;
	if (userID == undefined) userID = -1;
	request.post(
		getHttp() + API_HOST + "/inventory",
		{
			json: {
				token: token,
				page: page,
				search: search,
				next: next,
				userID: userID,
				sortType: sortType,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				for (var i = 0; i < body.inventory.length; i++) {
					addPathCard(body.inventory[i].card);
				}
				callback({
					status: 0,
					cards: body.inventory,
					page: body.page,
					pagemax: body.pagemax,
				});
			} else {
				callback({ status: 1 });
			}
		}
	);
}

app.post("/card", redirectLogin, function (req, res) {
	var uuid = req.body.uuid;
	var page = req.body.page;
	var next = req.body.next;
	if (next == undefined) next = -1;
	if (next == -1) {
		if (uuid == undefined) {
			res.send({ status: 1 });
			return;
		}
	}
	if (page == undefined) page = 0;

	request.post(
		getHttp() + API_HOST + "/card",
		{
			json: {
				token: req.cookies.token,
				uuid: uuid,
				page: page,
				next: next,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				for (var i = 0; i < body.inventory.length; i++) {
					addPathCard(body.inventory[i].card);
				}

				addPathCard(body.card);

				res.send({
					status: 0,
					userID: req.cookies.userID,
					maincard: body.card,
					cards: body.inventory,
					page: body.page,
					pagemax: body.pagemax,
				});
			} else {
				res.send({ status: 1 });
			}
		}
	);
});

app.get("/card", redirectLogin, async function (req, res) {
	res.locals.message = req.query.errorMessage;
	var uuid = req.query.uuid;
	var dashboard = await getDashboard(req, res);
	res.render("card", { uuid: uuid, dashboard: dashboard });
});

app.get("/upgrade", redirectLogin, function (req, res) {
	var mainuuid = req.query.mainuuid;
	var carduuid = req.query.carduuid;
	if (mainuuid == undefined || carduuid == undefined) {
		res.redirect("/dashboard?errorMessage='Wrong Data'");
	}

	request.post(
		getHttp() + API_HOST + "/upgrade",
		{
			json: {
				token: req.cookies.token,
				mainuuid: mainuuid,
				carduuid: carduuid,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.redirect("/card?uuid=" + body.uuid);
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.get("/friends", redirectLogin, function (req, res) {
	res.locals.message = req.query.errorMessage;
	request.post(
		getHttp() + API_HOST + "/friends",
		{
			json: {
				token: req.cookies.token,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		async (error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				var dashboard = await getDashboard(req, res);
				res.render("friends", {
					friends: body.friends,
					userID: req.cookies.userID,
					dashboard: dashboard,
				});
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.post("/addfriend", redirectLogin, function (req, res) {
	//console.log("TESTSFD");
	var username = req.body.username;
	if (username == undefined) {
		res.redirect("/friends");
	}

	request.post(
		getHttp() + API_HOST + "/addfriend",
		{
			json: {
				token: req.cookies.token,
				username: username,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			//console.log(body);
			//console.log(error);
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.redirect("/friends");
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.post("/managefriend", redirectLogin, function (req, res) {
	var userID = req.body.userID;
	var command = parseInt(req.body.command);
	if (userID == undefined || command == undefined || isNaN(command)) {
		res.redirect("/friends");
	}

	request.post(
		getHttp() + API_HOST + "/managefriend",
		{
			json: {
				token: req.cookies.token,
				userID: userID,
				command: command,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.redirect("/friends");
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.get("/trade", redirectLogin, function (req, res) {
	res.locals.message = req.query.errorMessage;
	var userID = req.query.userID;

	request.post(
		getHttp() + API_HOST + "/trade",
		{
			json: {
				token: req.cookies.token,
				userID: userID,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		async (error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				for (var i = 0; i < body.data.selfcards.length; i++) {
					addPathCard(body.data.selfcards[i]);
				}
				for (var i = 0; i < body.data.friendcards.length; i++) {
					addPathCard(body.data.friendcards[i]);
				}
				var dashboard = await getDashboard(req, res);
				res.render("trade", {
					userID: userID,
					data: body.data,
					username: body.username,
					statusone: body.statusone,
					statustwo: body.statustwo,
					dashboard: dashboard,
				});
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.post("/addTrade", redirectLogin, function (req, res) {
	var userID = req.body.userID;
	var cardID = req.body.cardID;

	request.post(
		getHttp() + API_HOST + "/addTrade",
		{
			json: {
				token: req.cookies.token,
				userID: userID,
				cardID: cardID,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.redirect("/trade?userID=" + userID);
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.get("/tradeinventory", redirectLogin, async function (req, res) {
	res.locals.message = req.query.errorMessage;
	var userID = req.query.userID;
	if (userID == undefined || isNaN(userID)) {
		res.redirect("/dashboard?errorMessage='Wrong Data'");
		return;
	}
	//console.log(userID);
	var dashboard = await getDashboard(req, res);
	res.render("tradeinventory", {
		friendID: userID,
		dashboard: dashboard,
	});
});

app.post("/removeTrade", redirectLogin, function (req, res) {
	var userID = req.body.userID;
	var cardID = req.body.cardID;

	request.post(
		getHttp() + API_HOST + "/removeTrade",
		{
			json: {
				token: req.cookies.token,
				userID: userID,
				cardID: cardID,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.redirect("/trade?userID=" + userID);
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.post("/okTrade", redirectLogin, function (req, res) {
	var userID = req.body.userID;

	request.post(
		getHttp() + API_HOST + "/okTrade",
		{
			json: {
				token: req.cookies.token,
				userID: userID,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.redirect("/trade?userID=" + userID);
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.post("/deleteNotification", redirectLogin, function (req, res) {
	var nId = req.body.notificationID;
	var nId = parseInt(nId);

	if (isNaN(nId)) {
		res.send({ status: 1 });
		return;
	}

	request.post(
		getHttp() + API_HOST + "/deleteNotification",
		{
			json: {
				token: req.cookies.token,
				notificationID: nId,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.send({ status: 0 });
			} else {
				res.send({ status: 1 });
			}
		}
	);
});

app.post("/deleteAllNotifications", redirectLogin, function (req, res) {
	request.post(
		getHttp() + API_HOST + "/deleteAllNotifications",
		{
			json: {
				token: req.cookies.token,
			},
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.send({ status: 0 });
			} else {
				res.send({ status: 1 });
			}
		}
	);
});

function addPathCard(card) {
	card.cardImage = getHttp() + API_HOST + "/" + card.cardImage;
	card.frame.path_front = getHttp() + API_HOST + "/" + card.frame.path_front;
	card.frame.path_back = getHttp() + API_HOST + "/" + card.frame.path_back;
}

//https.createServer(options, app).listen(port);
//console.log("Server started at port %s", port);
app.listen(port, function () {
	console.log("Server started at port %s", port);
});

function renderUserView(req, res, next) {
	var userID = undefined;

	res.locals.url = getHttp() + req.get("host");
	res.locals.api_url = getHttp() + API_HOST;

	userID = req.cookies.userID;
	res.locals.userID = userID;

	getRankID(userID, (rankID) => {
		getNotifications(req.cookies.token, (data) => {
			res.locals.rankID = rankID;
			res.locals.notifications = data;

			next();
		});
	});
}

function getRankID(userID, callback) {
	if (userID != undefined) {
		request.get(
			{
				url: getHttp() + API_HOST + "/" + userID + "/rank",
			},
			function (err, res) {
				if (res != undefined) {
					if (res.body != undefined) {
						var data = JSON.parse(res.body);

						if (data.status != undefined) {
							if (data.status == 1) {
								callback(data.rankID);
								return;
							}
						}
					}
				}

				callback(undefined);
			}
		);
	} else callback(undefined);
}

function getPageBody(url) {
	return new Promise((resolve, reject) => {
		request(url, (error, response, body) => {
			if (error) reject(error);
			if (response.statusCode != 200) {
				reject("Invalid status code <" + response.statusCode + ">");
			}
			resolve(body);
		});
	});
}

function getNotifications(token, callback) {
	if (token != undefined) {
		request.post(
			getHttp() + API_HOST + "/notifications",
			{
				json: {
					token: token,
				},
				rejectUnauthorized: false,
				requestCert: false,
				agent: false,
			},
			(err, res, body) => {
				if (body.status != undefined) {
					if (body.status == 0) {
						callback(body.data);
						return;
					}
				}

				callback(undefined);
			}
		);
	} else callback(undefined);
}
