const sql = require("mysql");
const readline = require("readline");

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

init(() => {
	run();
	function run() {
		rl.question("#:", (query) => {
			if (query == "QUIT") {
				rl.close();
				process.exit(0);
			}
			con.query(query, (err, result, fields) => {
				if (err) console.log(err);
				console.log(result);
				run();
			});
		});
	}
});
