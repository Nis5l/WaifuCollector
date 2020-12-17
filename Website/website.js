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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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

			if(rankID != undefined && rankID == 1){

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
	res.cookie("accepted", true);
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
	res.render("register", { userID: req.cookies.userID });
});

/*

    ERROR CODES:
        2 : username or password are null, empty or unidentified

*/

app.post("/register", redirectDashboard, function (req, res) {
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

app.get("/dashboard", redirectLogin, function (req, res) {
	request.post(
		getHttp() + API_HOST + "/getDashboard",
		{
			json: { token: req.cookies.token },
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200) {
				if (body.status == 0 || body.status == 1) {
					var username = body.name;
				} else {
					var username = body.message;
				}
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}

			if (body.status == 0) {
				res.render("dashboard", {
					userID: req.cookies.userID,
					time: 0,
					username: username,
					fulltime: body.fullTime,
					friends: body.friendcount,
					maxfriends: body.maxfriendcount,
				});
			} else if (body.status == 1) {
				res.render("dashboard", {
					userID: req.cookies.userID,
					time: body.packTime,
					username: username,
					fulltime: body.fullTime,
					friends: body.friendcount,
					maxfriends: body.maxfriendcount,
				});
			} else {
				res.redirect(
					"/login?errorCode=" + body.status + "&errorMessage=" + body.message
				);
			}
		}
	);
});

app.get("/adminpanel", redirectIfNotAdmin, function(req, res){

	res.render("adminpanel");

});

app.get("/settings", redirectLogin, function (req, res) {
	res.render("settings", { userID: req.cookies.userID });
});

app.get("/pack", redirectLogin, function (req, res) {
	request.post(
		getHttp() + API_HOST + "/pack",
		{
			json: { token: req.cookies.token },
			rejectUnauthorized: false,
			requestCert: false,
			agent: false,
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200) {
				if (body.packTime == "0") {
					for (var i = 0; i < body.cards.length; i++) {
						addPathCard(body.cards[i]);
					}
					res.render("pack", {
						userID: req.cookies.userID,
						cards: body.cards,
					});
				} else {
					res.redirect("/dashboard?errorCode=" + body.message);
				}
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.get("/inventory", redirectLogin, function (req, res) {
	var page = req.query.page;
	var search = req.query.search;
	var next = req.query.next;
	if (next == "0") next = 0;
	else if (next == "1") next = 1;
	if (next == undefined) next = 2;
	if (search == undefined) search = "";
	if (page == undefined) page = 0;

	request.post(
		getHttp() + API_HOST + "/inventory",
		{
			json: {
				token: req.cookies.token,
				page: page,
				search: search,
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
				res.render("inventory", {
					userID: req.cookies.userID,
					cards: body.inventory,
					page: body.page,
					pagemax: body.pagemax,
				});
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.get("/card", redirectLogin, function (req, res) {
	var uuid = req.query.uuid;
	var page = req.query.page;
	var next = req.query.next;
	if (next == undefined) next = -1;
	if (next == -1) {
		if (uuid == undefined) return;
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

				res.render("card", {
					userID: req.cookies.userID,
					maincard: body.card,
					cards: body.inventory,
					page: body.page,
					pagemax: body.pagemax,
				});
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.get("/upgrade", redirectLogin, function (req, res) {
	var mainuuid = req.query.mainuuid;
	var carduuid = req.query.carduuid;
	if (mainuuid == undefined || carduuid == undefined) {
		res.redirect("/dashboard");
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
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				res.render("friends", {
					friends: body.friends,
					userID: req.cookies.userID,
				});
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
});

app.post("/addfriend", redirectLogin, function (req, res) {
	console.log("TESTSFD");
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
			console.log(body);
			console.log(error);
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
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				for (var i = 0; i < body.data.selfcards.length; i++) {
					addPathCard(body.data.selfcards[i]);
				}
				for (var i = 0; i < body.data.friendcards.length; i++) {
					addPathCard(body.data.friendcards[i]);
				}
				res.render("trade", {
					userID: userID,
					data: body.data,
					username: body.username,
					statusone: body.statusone,
					statustwo: body.statustwo,
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

app.get("/tradeinventory", redirectLogin, function (req, res) {
	var userID = req.query.userID;
	var page = req.query.page;
	var search = req.query.search;
	var next = req.query.next;
	if (userID == undefined || isNaN(userID)) {
		res.redirect("/dashboard");
		return;
	}
	if (next == "0") next = 0;
	else if (next == "1") next = 1;
	if (next == undefined) next = 2;
	if (search == undefined) search = "";
	if (page == undefined) page = 0;

	request.post(
		getHttp() + API_HOST + "/inventory",
		{
			json: {
				token: req.cookies.token,
				page: page,
				search: search,
				next: next,
				userID: userID,
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
				res.render("tradeinventory", {
					userID: userID,
					cards: body.inventory,
					page: body.page,
					pagemax: body.pagemax,
				});
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}
		}
	);
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

function renderUserView(req, res, next){

	var userID = undefined;

	userID = req.cookies.userID;
	res.locals.userID = userID;

	getRankID(userID, (rankID) => {

		res.locals.rankID = rankID;

		next();

	})

}

function getRankID(userID, callback){

	if(userID != undefined){
	
		request.get({
			url: getHttp() + API_HOST + "/" + userID + "/rank",
		}, function (err, res) {

			var data = JSON.parse(res.body);

			if(data.status != undefined){

				if(data.status == 1){

					callback(data.rankID);
					return;

				}

			}

			callback(undefined);

		});

	}else
		callback(undefined);

}
