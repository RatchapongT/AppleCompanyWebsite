module.exports = function () {
    var passport = require('passport');
    var passportLocal = require('passport-local');
    var databaseService = require('../services/database-service');
    var bcrypt = require('bcrypt');
    passport.use(new passportLocal.Strategy({usernameField: 'username'}, function (username, password, next) {
        databaseService.findUser(username, function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return next(null, null);
            }

            bcrypt.compare(password, user.password, function (err, same) {
                if (err) {
                    return next(err);

                }
                if (!same) {
                    return next(null, null);
                }
                next(null, user);
            });
        });
    }));

    passport.serializeUser(function (user, next) {
        next(null, user.username);
    });

    passport.deserializeUser(function (username, next) {
        databaseService.findUser(username, function (err, user) {
            next(err, user);
        });
    });
};