var config = {};

config.mongoUri = 'mongodb://localhost:27017/myApp';
config.cookieMaxAge = 3 * 60 * 60 * 1000; //ms
module.exports = config;