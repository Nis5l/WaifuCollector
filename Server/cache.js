const database = require("./database");

class Client {
	constructor(id, username, loadedCallback) {
		this.id = id;
		this.packTime = -1;
		this.username = username;
		this.inventory = [];
		this.friends = [];
		this.lastids = undefined;
		this.page = 0;
		this.lastmain = undefined;
		var operations = 3;
		var operationsComplete = 0;

		database.getPackTime(this.id, (time) => {
			this.packTime = time;
			operationFinished();
		});

		database.getInventory(this.id, (inventory) => {
			this.inventory = inventory;
			this.sortInv();
			operationFinished();
		});

		database.getFriends(this.id, (friends) => {
			for (var i in friends) {
				if (this.id == friends[i].userone)
					if (friends[i].status == 0) {
						this.friends.push({
							userID: friends[i].usertwo,
							status: 1,
						});
					} else {
						this.friends.push({
							userID: friends[i].usertwo,
							status: friends[i].status,
						});
					}
				else
					this.friends.push({
						userID: friends[i].userone,
						status: friends[i].status,
					});
			}
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
		this.time = time;
		this.callback = callback;
		if (this.timeout != undefined && this.timeout != null)
			clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			callback(this.id);
		}, time);
	}

	refresh() {
		this.startDecay(this.time, this.callback);
	}

	addCard(card) {
		this.startDecay(this.time, this.callback);
		this.inventory.push(card);
		this.sortInv();
	}

	getFriends() {
		this.startDecay(this.time, this.callback);
		return this.friends;
	}

	hasFriend(id) {
		this.startDecay(this.time, this.callback);
		for (var i = 0; i < this.friends.length; i++) {
			if (this.friends[i].userID == id) return true;
		}
		return false;
	}

	hasFriendAdded(id) {
		this.startDecay(this.time, this.callback);
		for (var i = 0; i < this.friends.length; i++) {
			if (this.friends[i].userID == id && this.friends[i].status == 2)
				return true;
		}
		return false;
	}

	addFriendRequest(id) {
		this.friends.push({ userID: id, status: 1 });
	}

	acceptFriendRequest(id) {
		this.startDecay(this.time, this.callback);
		for (var i = 0; i < this.friends.length; i++) {
			if (this.friends[i].userID == id && this.friends[i].status == 0) {
				this.friends[i].status = 2;
				return true;
			}
		}
		return false;
	}

	deleteFriend(id) {
		this.startDecay(this.time, this.callback);
		for (var i = 0; i < this.friends.length; i++) {
			if (this.friends[i].userID == id) {
				this.friends.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	getInventory(page, amount, ids, exclude, level) {
		this.startDecay(this.time, this.callback);
		this.lastids = ids;
		this.lastexclude = exclude;
		this.lastlevel = level;

		var ret = [];
		var newinv = [];
		for (var obj in this.inventory) {
			if (ids == undefined || ids.includes(this.inventory[obj].cardID))
				if (exclude == undefined || !exclude.includes(this.inventory[obj].id))
					if (level == undefined || this.inventory[obj].level == level)
						newinv.push(this.inventory[obj]);
		}
		this.pageamount = Math.ceil(newinv.length / amount);
		if (page >= this.pageamount) page = this.pageamount - 1;
		for (var i = page * amount; i < page * amount + amount; i++) {
			if (i < newinv.length && i >= 0) ret.push(newinv[i]);
		}

		this.page = page;
		return ret;
	}

	getPageStats() {
		return [this.page + 1, this.pageamount];
	}

	nextPage(amount) {
		this.page++;
		return this.getInventory(
			this.page,
			amount,
			this.lastids,
			this.lastexclude,
			this.lastlevel
		);
	}

	prevPage(amount) {
		this.page--;
		if (this.page < 0) this.page = 0;
		return this.getInventory(
			this.page,
			amount,
			this.lastids,
			this.lastexclude,
			this.lastlevel
		);
	}

	sortInv() {
		this.startDecay(this.time, this.callback);
		while (true) {
			var sorted = true;
			for (var i = 0; i < this.inventory.length - 1; i++) {
				if (this.inventory[i].level < this.inventory[i + 1].level) {
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
	deleteCard(uuid) {
		for (var i = 0; i < this.inventory.length; i++) {
			if (this.inventory[i].id == uuid) {
				this.inventory.splice(i, 1);
				return;
			}
		}
	}

	getCard(uuid) {
		for (var i = 0; i < this.inventory.length; i++) {
			if (this.inventory[i].id == uuid) {
				return this.inventory[i];
			}
		}
	}
}
module.exports = Client;
