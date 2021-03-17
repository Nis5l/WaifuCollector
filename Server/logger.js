const moment = require("moment");
const fs = require("fs");
var file;
var options = {hourCycle: "h23", day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit'};
module.exports =
{
	init: function init(_file) {
		file = _file;
	},
	write: function write(string) {
		try {
			var d = new Date(moment().valueOf());
			var timestring = d.toLocaleDateString("en-US", options);
			fs.appendFile(file, "[" + timestring + "] " + string + "\n", () => {});
		} catch (ex) {
		}
	},
	read: function read(callback) {
		try {
			fs.readFile(file, {encoding: 'utf-8'}, function (err, data) {
				callback(data);
			});
		} catch (ex) {
		}
	}
}
