const database = require("./database");

class Client 
{
    constructor(id, username, loadedCallback)
    {
        this.id = id;
        this.packTime = -1;
        this.username = username;

        var operations = 2;
        var operationsComplete = 0;
        
        database.getPackTime(this.id, (time) => {
            this.packTime = time;
            operationFinished();
        });

        database.getFriends(this.id, (friends) => {
            this.friends = [];
            if(friends != null)
            {
                for(var i = 0; i < friends.length; i++)
                {
                    this.friends.push(parseInt(friends[i].value));
                }
            }
            operationFinished();
        });

        function operationFinished()
        {
            operationsComplete++;
            if(operationsComplete == operations)
            {
                loadedCallback(id);
            }
        }

    }

    save()
    {
        database.setPackTime(this.id, this.packTime);
    }

    startDecay(time, callback)
    {
        setTimeout(() => {callback(this.id)},time);
    }

    addFriend(friendID)
    {
        this.friends[friends[i].userID] = friendID;
        database.addFriend(this.id, friendID);
    }

    getFriends()
    {
        return this.friends;
    }

}
module.exports = Client;