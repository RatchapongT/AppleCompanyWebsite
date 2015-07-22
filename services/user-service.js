var User = require('../models/user').User;
var bcrypt = require('bcrypt');

exports.addUser = function (user, next) {
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
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
    });


};

exports.findUser = function (username, next) {
    User.findOne({username: username}, function (err, user) {
        next(err, user);
    });
};