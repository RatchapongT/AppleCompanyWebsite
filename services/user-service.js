var User = require('../models/user').User;

exports.addUser = function(user, next) {
  var newUser = new User({
    username: user.username,
    password: user.password
  });
  
  newUser.save(function(err) {
    if (err) {
      return next(err);
    }
    next(null);
  });
};

exports.findUser = function(username, next) {
  User.findOne({username: username}, function(err, user) {
    next(err, user);    
  });
};