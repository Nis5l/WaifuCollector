const database = require("./database");
const cache = require("./serverCache");

class Client {
	constructor(id, username, mail, verified, loadedCallback) {
		this.id = id;
		this.verified = verified;
		this.mail = mail;
		this.packTime = -1;
		this.tradeTime = -1;
		this.username = username;
		this.inventorySort = 0;
		this.inventory = [];
		this.friends = [];
		this.lastids = undefined;
		this.page = 0;
		this.lastmain = undefined;
		this.cardTypeAmount = 0;
		this.lastsearch = undefined;
		this.friendinventory = undefined;
		var operations = 4;
		var operationsComplete = 0;

		database.getPackTime(this.id, (time) => {
			this.packTime = time;
			operationFinished();
		});

		database.getTradeTime(this.id, (time) => {
			this.tradeTime = time;
			operationFinished();
		});

		database.getInventory(this.id, (inventory) => {
			this.inventory = inventory;
			for (var i = 0; i < this.inventory.length; i++) delete this.inventory[i].userID;
			//this.sortInv();
			this.refreshCardTypeAmount();
			operationFinished();
		});

		database.getFriends(this.id, (friends) => {
			for (var i in friends) {
				if (this.id == friends[i].userone)
					if (friends[i].friend_status == 0) {
						this.friends.push({
							userID: friends[i].usertwo,
							friend_status: 1,
						});
					} else {
						this.friends.push({
							userID: friends[i].usertwo,
							friend_status: friends[i].friend_status,
						});
					}
				else
					this.friends.push({
						userID: friends[i].userone,
						friend_status: friends[i].friend_status,
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
		database.setTradeTime(this.id, this.tradeTime);
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
		this.refreshCardTypeAmount();
	}

	addCardFriend(card) {
		this.startDecay(this.time, this.callback);
		if(this.friendinventory == undefined) return;
		this.friendinventory.inventory.push(card);
		this.sortInv(true);
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
			if (this.friends[i].userID == id && this.friends[i].friend_status == 2)
				return true;
		}
		return false;
	}

	addFriendRequest(id) {
		this.startDecay(this.time, this.callback);
		this.friends.push({userID: id, friend_status: 1});
	}

	addFriendRequestIncoming(id) {
		this.startDecay(this.time, this.callback);
		this.friends.push({userID: id, friend_status: 0});
	}

	acceptFriendRequest(id) {
		this.startDecay(this.time, this.callback);
		for (var i = 0; i < this.friends.length; i++) {
			if (this.friends[i].userID == id && this.friends[i].friend_status == 0) {
				this.friends[i].friend_status = 2;
				return true;
			}
		}
		return false;
	}

	friendRequestAccepted(id) {
		this.startDecay(this.time, this.callback);
		for (var i = 0; i < this.friends.length; i++) {
			if (this.friends[i].userID == id) {
				this.friends[i].friend_status = 2;
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

	getInventory(page, amount, ids, exclude, level, sortMethod, friend) {
		this.startDecay(this.time, this.callback);
		if (sortMethod != undefined) this.inventorySort = sortMethod;
		this.sortInv(friend);
		this.lastids = ids;
		this.lastexclude = exclude;
		this.lastlevel = level;

		var inv = this.inventory;
		if (friend)
		{
			if(this.friendinventory == undefined) return;
			inv = this.friendinventory.inventory;
		}

		var ret = [];
		var newinv = [];
		for (var obj in inv) {
			if (ids == undefined || ids.includes(inv[obj].cardID))
				if (exclude == undefined || !exclude.includes(inv[obj].id))
					if (level == undefined || inv[obj].level == level)
						newinv.push(inv[obj]);
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

	nextPage(amount, friend) {
		this.page++;
		return this.getInventory(
			this.page,
			amount,
			this.lastids,
			this.lastexclude,
			this.lastlevel,
			undefined,
			friend
		);
	}

	prevPage(amount, friend) {
		this.page--;
		if (this.page < 0) this.page = 0;
		return this.getInventory(
			this.page,
			amount,
			this.lastids,
			this.lastexclude,
			this.lastlevel,
			undefined,
			friend
		);
	}

	sortInv(friend) {
		var sortinv = this.inventory;
		if (friend) sortinv = this.friendinventory.inventory;

		if (this.inventorySort < 0 || this.inventorySort > 2)
			this.inventorySort = 0;

		switch (this.inventorySort) {
			case 0:
				{
					this.sortInvName(sortinv);
				}
				break;
			case 1:
				{
					this.sortInvLevel(sortinv);
				}
				break;
			case 2:
				{
					this.sortInvUUID(sortinv);
				}
				break;
		}
	}

	sortInvName(inv) {
		this.startDecay(this.time, this.callback);
		while (true) {
			var sorted = true;
			for (var i = 0; i < inv.length - 1; i++) {
				if (
					cache.getSortByID(inv[i].cardID) >
					cache.getSortByID(inv[i + 1].cardID)
				) {
					sorted = false;
					swap(inv, i);
				} else if (
					cache.getSortByID(inv[i].cardID) ==
					cache.getSortByID(inv[i + 1].cardID)
				) {
					if (inv[i].level < inv[i + 1].level) {
						sorted = false;
						swap(inv, i);
					} else if (inv[i].level == inv[i + 1].level) {
						if (inv[i].quality < inv[i + 1].quality) {
							sorted = false;
							swap(inv, i);
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

	sortInvLevel(inv) {
		this.startDecay(this.time, this.callback);
		while (true) {
			var sorted = true;
			for (var i = 0; i < inv.length - 1; i++) {
				if (inv[i].level < inv[i + 1].level) {
					sorted = false;
					swap(inv, i);
				} else if (inv[i].level == inv[i + 1].level) {
					if (inv[i].quality < inv[i + 1].quality) {
						sorted = false;
						swap(inv, i);
					} else if (
						inv[i].quality == inv[i + 1].quality
					) {
						if (inv[i].cardID > inv[i + 1].cardID) {
							sorted = false;
							swap(inv, i);
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

	sortInvUUID(inv) {
		this.startDecay(this.time, this.callback);
		while (true) {
			var sorted = true;
			for (var i = 0; i < inv.length - 1; i++) {
				if (inv[i].id < inv[i + 1].id) {
					sorted = false;
					swap(inv, i);
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
				this.refreshCardTypeAmount();
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
		return undefined;
	}

	refreshCardTypeAmount() {
		this.cardTypeAmount = 0;
		var typeIDs = [];
		for (var i = 0; i < this.inventory.length; i++) {
			var exists = false;
			for (var j = 0; j < typeIDs.length; j++) {
				if (typeIDs[j] == this.inventory[i].cardID) {
					exists = true;
					break;
				}
			}
			if (!exists) {
				typeIDs.push(this.inventory[i].cardID);
				this.cardTypeAmount++;
			}
		}
	}

	getCardTypeAmount() {
		return this.cardTypeAmount;
	}
}
module.exports = Client;
