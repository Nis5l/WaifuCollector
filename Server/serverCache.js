const database = require("./database");

var nameToID = {};
var idToName = new Map();
var idToSort = new Map();
module.exports = {
	refreshCards: function refreshCards(callback) {
		database.getCards((cards) => {
			var namesort = [];
			for (var i = 0; i < cards.length; i++) {
				nameToID[cards[i].cardName] = cards[i].id;
				idToName.set(cards[i].id, cards[i].cardName);
				namesort[i] = { name: cards[i].cardName, id: cards[i].id };
			}
			var sorted = false;
			while (!sorted) {
				sorted = true;
				for (var i = 0; i < namesort.length - 1; i++) {
					if (namesort[i].name > namesort[i + 1].name) {
						var tmp = namesort[i];
						namesort[i] = namesort[i + 1];
						namesort[i + 1] = tmp;
						sorted = false;
					}
				}
			}
			for (var i = 0; i < namesort.length; i++) idToSort.set(namesort[i].id, i);
			callback();
		});
	},
	getIdsByString: function getIdsByName(name) {
		ids = [];
		for (hash in nameToID) {
			if (hash.toLowerCase().includes(name.toLowerCase()))
				ids.push(nameToID[hash]);
		}
		return ids;
	},
	getStringById: function getStringById(name) {
		if (idToName.has(name)) {
			return idToName.get(name);
		}
		return undefined;
	},
	getSortByID: function getSortByID(id) {
		if (idToSort.has(id)) return idToSort.get(id);
		return undefined;
	},
};
