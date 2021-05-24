module.exports = {

    getRandomInt: function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    isString: function isString(str) {
        return (typeof str === 'string' || str instanceof String);
    }
}
