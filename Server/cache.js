const database = require("./database");

class Client {
  constructor(id, username, loadedCallback) {
    this.id = id;
    this.packTime = -1;
    this.username = username;
    this.inventory = [];

    var operations = 3;
    var operationsComplete = 0;

    database.getPackTime(this.id, (time) => {
      this.packTime = time;
      operationFinished();
    });

    database.getFriends(this.id, (friends) => {
      this.friends = [];
      if (friends != null) {
        for (var i = 0; i < friends.length; i++) {
          this.friends.push(parseInt(friends[i].value));
        }
      }
      operationFinished();
    });

    database.getInventory(this.id, (inventory) => {
      this.inventory = inventory;
      this.sortInv();
      operationFinished();
    });

    function operationFinished() {
      operationsComplete++;
      if (operationsComplete == operations) {
        loadedCallback(id);
      }
    }
  }

  save() {
    database.setPackTime(this.id, this.packTime);
  }

  startDecay(time, callback) {
    setTimeout(() => {
      callback(this.id);
    }, time);
  }

  addFriend(friendID) {
    this.friends[friends[i].userID] = friendID;
    database.addFriend(this.id, friendID);
  }

  getFriends() {
    return this.friends;
  }

  addCard(card) {
    this.inventory.push(card);
    this.sortInv();
  }

  getInventory(page, amount) {
    var ret = [];
    for (var i = page * amount; i < page * amount + amount; i++) {
      if (i < this.inventory.length && i >= 0) ret.push(this.inventory[i]);
    }
    return ret;
  }

  sortInv() {
    while (true) {
      var sorted = true;
      for (var i = 0; i < this.inventory.length - 1; i++) {
        if (this.inventory[i].level > this.inventory[i + 1].level) {
          sorted = false;
          swap(this.inventory, i);
        } else if (this.inventory[i].level == this.inventory[i + 1].level) {
          if (this.inventory[i].quality > this.inventory[i + 1].quality) {
            sorted = false;
            swap(this.inventory, i);
          } else if (
            this.inventory[i].quality == this.inventory[i + 1].quality
          ) {
            if (this.inventory[i].cardID > this.inventory[i + 1].cardID) {
              sorted = false;
              swap(this.inventory, i);
            }
          }
        }
      }
      if (sorted) return;
    }
    function swap(inventory, i) {
      var t = inventory[i];
      inventory[i] = inventory[i + 1];
      inventory[i + 1] = t;
    }
  }
}
module.exports = Client;
