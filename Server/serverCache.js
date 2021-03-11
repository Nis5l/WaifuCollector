const database = require("./database");
const moment = require("moment");

var nameToID = {};
var animeToID = {};
var animeNameToIDs = {};
var idToAnime = new Map();
var idToName = new Map();
var idToSort = new Map();
var packData = [];
var cardAmount = 0;
var packInterval = undefined;
module.exports = {
	refreshCards: function refreshCards(callback) {
		database.getAnimes((animes) => {
			for (var i = 0; i < animes.length; i++) {
				animeToID[animes[i].name] = animes[i].id;
				animeNameToIDs[animes[i].name] = [];
				idToAnime.set(animes[i].id, animes[i].name);
			}
			database.getCards((cards) => {
				cardAmount = cards.length;
				var namesort = [];
				for (var i = 0; i < cards.length; i++) {
					nameToID[cards[i].cardName] = cards[i].id;
					idToName.set(cards[i].id, cards[i].cardName);
					namesort[i] = {name: cards[i].cardName, id: cards[i].id};
					animeNameToIDs[idToAnime.get(cards[i].typeID)].push(cards[i].id);
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
				for (var i = 0; i < namesort.length; i++)
					idToSort.set(namesort[i].id, i);
				callback();
			});
		});
	},
	getIdsByString: function getIdsByString(name) {
		ids = [];
		name = name.toLowerCase();
		for (hash in nameToID) {
			if (name == "") {
				ids.push(nameToID[hash]);
				continue;
			}
			for (var i = 0; i < hash.length; i++) {
				if (hash.toLowerCase()[i] == name[0]) {
					var containsall = true;
					i++;
					for (var j = 1; j < name.length; j++, i++) {
						if (i >= hash.length) {
							containsall = false;
							break;
						}

						if (hash.toLowerCase()[i] != name[j]) {
							containsall = false;
							break;
						}
					}
					if (containsall) {
						ids.push(nameToID[hash]);
					}
				}
			}
		}

		if (name != "") {
			for (hash in animeNameToIDs) {
				for (var i = 0; i < hash.length; i++) {
					if (hash.toLowerCase()[i] == name[0]) {
						var containsall = true;
						i++;
						for (var j = 1; j < name.length; j++, i++) {
							if (i >= hash.length) {
								containsall = false;
								break;
							}

							if (hash.toLowerCase()[i] != name[j]) {
								containsall = false;
								break;
							}
						}
						if (containsall) {
							var aids = animeNameToIDs[hash];
							for (var k = 0; k < aids.length; k++) {
								var containsid = false;
								var idt = aids[k];
								for (var j = 0; j < ids.length; j++) {
									if (ids[j] == idt) {
										containsid = true;
										break;
									}
								}
								if (!containsid) ids.push(idt);
							}
						}
					}
				}
			}
		}

		//ids = ids.reverse();

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
	getCardAmount: function getCardAmount() {
		return cardAmount;
	},
	loadPackData: function loadPackData(packSpan, sendSpan, callback) {
		var mnt = moment().valueOf();
		var nowDate = mnt - (mnt % packSpan) + packSpan;
		var pastDate = nowDate - (sendSpan - (sendSpan % packSpan));
		database.getPackDataRange(pastDate, nowDate, (data) => {
			packData = [];
			for (var j = 0; pastDate <= nowDate; pastDate += packSpan, j++) {
				packData.push({time: pastDate, amount: 0});
				for (var i = 0; i < data.length; i++) {
					if (data[i].time == packData[j].time) {
						packData[j].amount = data[i].amount;
						break;
					}
				}
			}
			if (packInterval == undefined) clearInterval(packInterval);
			setTimeout(() => {
				updatePackData(packSpan);
				packInterval = setInterval(() => {
					updatePackData(packSpan);
				}, packSpan);
			}, nowDate - moment().valueOf());
			if (callback != undefined) callback();

			function updatePackData(packSpan) {
				var mnt = moment().valueOf();
				var nowDate = mnt - (mnt % packSpan) + packSpan;
				for (var i = 1; i < packData.length; i++) {
					packData[i - 1] = packData[i];
				}
				packData[packData.length - 1] = {time: nowDate, amount: 0};
			}
		});
	},
	addPackData: function addPackData(packDate) {
		for (var i = 0; i < packData.length; i++) {
			console.log(new Date(packData[i].time).toString());
			console.log(new Date(packDate).toString());
			console.log();
			if (packData[i].time == packDate) {
				console.log("XXXX");
				packData[i].amount++;
				return;
			}
		}
	},
	getPackData: function getPackData() {
		return packData;
	},
};
