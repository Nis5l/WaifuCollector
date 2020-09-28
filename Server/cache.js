const database = require("./database");

class Client 
{
    constructor(id, loadedCallback)
    {
        this.id = id;
        this.packTime = -1;
        database.getPackTime(this.id, (time) => {
            this.packTime = time;
            loadedCallback(this.id);
        });
    }

    save()
    {
        database.setPackTime(this.id, this.packTime);
    }

    startDecay(time, callback)
    {
        setTimeout(() => {callback(this.id)},time);
    }

}
module.exports = Client;