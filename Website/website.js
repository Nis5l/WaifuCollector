const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { cookie } = require("request");
const { render } = require("node-sass");
require("./CSSManager.js");

const app = express();

app.set("view engine", "ejs");
app.use("/resources", express.static("resources"));
app.use("/assets", express.static("assets"));

const port = 8000;

var token;
const {
	API_HOST = "31.177.115.247",
	//API_HOST = "localhost",
	//API_HOST = "192.168.178.55",
	API_PORT = "100",

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
	if (!req.session.userID) {
		res.redirect("/login");
	} else {
		next();
	}
};

const redirectDashboard = (req, res, next) => {
	if (req.session.userID) {
		res.redirect("/dashboard");
	} else {
		next();
	}
};

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.get("/", function (req, res) {
	res.render("home", { userID: req.session.userID });
});

app.get("/logout", redirectLogin, function (req, res) {
	req.session.destroy();
	res.redirect("/login");
});

app.get("/login", redirectDashboard, function (req, res) {
	res.render("login", { userID: req.session.userID });
});

app.post("/login", redirectDashboard, function (req, res) {
	const { username, password } = req.body;

	if (username && password) {
		request.post(
			"http://" + API_HOST + ":" + API_PORT + "/login",
			{
				json: {
					username: username,
					password: password,
				},
			},
			(error, response, body) => {
				if (!error && response.statusCode == 200) {
					if (body.status == 0) {
						token = body.token;

						userID = body.userID;

						req.session.userID = userID;
						req.session.token = token;

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
	console.log(password + " " + password2);
	if (password && password2 && password == password2 && token) {
		request.post(
			"http://" + API_HOST + ":" + API_PORT + "/passchange",
			{
				json: {
					token: token,
					newpassword: password,
				},
			},
			(error, response, body) => {
				if (!error && response.statusCode == 200) {
					if (body.status == 0) {
						res.redirect("/dashboard");
						//alert("Password Changed");
					}
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
	res.render("register", { userID: req.session.userID });
});

/*

    ERROR CODES:
        2 : username or password are null, empty or unidentified

*/

app.post("/register", redirectDashboard, function (req, res) {
	const { username, password } = req.body;
	if (username && password) {
		request.post(
			"http://" + API_HOST + ":" + API_PORT + "/register",
			{
				json: {
					username: username,
					password: password,
				},
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
		"http://" + API_HOST + ":" + API_PORT + "/getName",
		{ json: { token: token } },
		(error, response, body) => {
			if (!error && response.statusCode == 200) {
				if (body.status == 0) {
					var username = body.name;
					//res.render('dashboard', { userID: req.session.userID, username: })
				} else {
					var username = body.message;
					//res.render('dashboard', { userID: req.session.userID, username: body.status.message})
				}
			} else {
				res.redirect("/login?errorCode=3&errorMessage=Wrong response");
			}

			request.post(
				"http://" + API_HOST + ":" + API_PORT + "/getPackTime",
				{
					json: {
						token: token,
					},
				},
				(error, response, body) => {
					if (!error && response.statusCode == 200) {
						if (body.status == 0) {
							res.render("dashboard", {
								userID: req.session.userID,
								time: 0,
								username: username,
								fulltime: body.fullTime,
							});
						} else if (body.status == 1) {
							res.render("dashboard", {
								userID: req.session.userID,
								time: body.packTime,
								username: username,
								fulltime: body.fullTime,
							});
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
		}
	);
});

app.get("/settings", redirectLogin, function (req, res) {
	res.render("settings");
});

app.get("/pack", redirectLogin, function (req, res) {
	request.post(
		"http://" + API_HOST + ":" + API_PORT + "/pack",
		{ json: { token: token } },
		(error, response, body) => {
			if (!error && response.statusCode == 200) {
				if (body.packTime == "0") {
					for (var i = 0; i < body.cards.length; i++) {
						addPathCard(body.cards[i]);
					}
					res.render("pack", {
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
		"http://" + API_HOST + ":" + API_PORT + "/inventory",
		{
			json: {
				token: token,
				page: page,
				search: search,
				next: next,
			},
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				for (var i = 0; i < body.inventory.length; i++) {
					addPathCard(body.inventory[i].card);
				}
				res.render("inventory", {
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
		"http://" + API_HOST + ":" + API_PORT + "/card",
		{
			json: {
				token: token,
				uuid: uuid,
				page: page,
				next: next,
			},
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				for (var i = 0; i < body.inventory.length; i++) {
					addPathCard(body.inventory[i].card);
				}

				console.log(body.card);
				addPathCard(body.card);

				res.render("card", {
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
	if (mainuuid == undefined) return;
	if (carduuid == undefined) return;
	request.post(
		"http://" + API_HOST + ":" + API_PORT + "/upgrade",
		{
			json: {
				token: token,
				mainuuid: mainuuid,
				carduuid: carduuid,
			},
		},
		(error, response, body) => {
			if (!error && response.statusCode == 200 && body.status == 0) {
				for (var i = 0; i < body.inventory.length; i++) {
					addPathCard(body.inventory[i].card);
				}

				addPathCard(body.card);

				console.log(body);
				res.render("card", {
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

function addPathCard(card) {
	card.cardImage = "http://" + API_HOST + ":" + API_PORT + "/" + card.cardImage;
	card.frame.path_front =
		"http://" + API_HOST + ":" + API_PORT + "/" + card.frame.path_front;
	card.frame.path_back =
		"http://" + API_HOST + ":" + API_PORT + "/" + card.frame.path_back;
}

app.listen(port, function () {
	console.log("Server started at port %s", port);
});
