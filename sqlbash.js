const sql = require("mysql");
const readline = require("readline");
const utils = require("./Server/utils");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const config = require("./Server/config.json");

var con = sql.createConnection({
	host: config.mysql.host,
	port: config.mysql.port,
	user: config.mysql.user,
	password: config.mysql.password,
});

function init(callback) {
	console.log("Using");
	con.connect((err) => {
		if (err) console.log(err);
		con.query("USE " + config.mysql.database + ";", () => {
			callback();
		});
	});
}

function generate(callback) {
	var amount = 10;
	con.query("SELECT * FROM cardtype", (err, anime) => {
		run();

		var pool = 0;
		function run() {
			if (anime.length == 0) {
				callback();
				return;
			}

			var obj = [];
			var count = 0;
			pool++;
			run2(0);

			function run2(i) {
				if (i == amount || anime.length == 0) {
					console.log("Pool[" + pool + "](" + count + " cards):");
					for (var j = 0; j < obj.length; j++) {
						process.stdout.write("\t" + obj[j].anime.name + "(" + obj[j].cards.length + " cards): ");
						for (var k = 0; k < obj[j].cards.length; k++) {
							process.stdout.write(obj[j].cards[k].cardName);
							if (k != obj[j].cards.length - 1)
								process.stdout.write(", ");
						}
						console.log("");
					}
					run();
					return;
				}

				var idx = utils.getRandomInt(0, anime.length - 1);
				con.query(`SELECT * FROM card WHERE typeID = ${anime[idx].id}`, (err, card) => {
					count += card.length;
					var cards = [];
					for (var j = 0; j < card.length; j++) {
						cards.push(card[j]);
					}
					obj.push({anime: anime[idx], cards: cards});
					anime.splice(idx, 1);
					run2(i + 1);
				})
			}
		}
	});
}

function cards(callback) {
	const getCards = (id) => {
		return new Promise((resolve) => {
			con.query("SELECT * FROM card WHERE typeID = ?", [id], (err, res) => {
				if (err) console.log(err);
				resolve(res);
			});
		});
	}
	con.query("SELECT * FROM cardType", async (err, animes) => {
		if (err) console.log(err);
		for (let anime of animes) {
			console.log(anime.name + ":");
			const cards = await getCards(anime.id)
			for (let card of cards) {
				console.log("\t" + card.cardName);
			}
		}
		callback();
	})
}

init(() => {
	run();
	function run() {
		rl.question("#:", (query) => {
			if (query == "QUIT") {
				rl.close();
				process.exit(0);
			}
			else if (query == "GENERATE") {
				generate(() => {
					run();
				});
			}
			else if (query == "CARDS") {
				cards(() => {
					run();
				});
			} else {
				con.query(query, (err, result, fields) => {
					if (err) console.log(err);
					console.log(result);
					run();
				});
			}
		});
	}
});
