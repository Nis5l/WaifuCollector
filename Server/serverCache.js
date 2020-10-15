const database = require("./database");

var nameToID = {};
module.exports = {
  refreshCards: function refreshCards(callback) {
    database.getCards((cards) => {
      for (var i = 0; i < cards.length; i++) {
        nameToID[cards[i].cardName] = cards[i].id;
      }
      callback();
    });
  },
  getIdsByString: function getIdsByName(name) {
    ids = [];
    for (hash in nameToID) {
      if (hash.includes(name)) ids.push(nameToID[hash]);
    }
    return ids;
  },
};
