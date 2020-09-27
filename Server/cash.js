const database = require("./database");

class Client 
{
    constructor(id, loadedCallback)
    {
        this.id = id;
        this.packTime = -1;
        database.getPackTime(id, (time) => {
            this.packTime = time;
            loadedCallback(id);
        });
    }

    save()
    {
        database.setPackTime(this.packTime);
    }

    startDecay(time, callback)
    {
        setTimeout(() => {callback(this.id)},time);
    }

}
module.exports = Client;