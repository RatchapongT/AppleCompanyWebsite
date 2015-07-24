var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userService = require('../services/user-service');

var userSchema = new Schema({
  username: String,
  password: String,
  created: {type: Date, default: Date.now}
});

userSchema.path('username').validate(function(value, next) {

  userService.findUser(value, function(err, user) {
    if (err) {
      console.log(err);
      return next(false);
    }
    console.log(!user);
    next(!user);
  });
}, 'That username is already in use');

var User = mongoose.model('User', userSchema);

module.exports = {
  User: User
};