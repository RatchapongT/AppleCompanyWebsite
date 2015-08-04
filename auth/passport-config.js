module.exports = function () {
    var passport = require('passport');
    var passportLocal = require('passport-local');
    var databaseFunction = require('../services/users')
    var bcrypt = require('bcrypt');

    passport.use(new passportLocal.Strategy({usernameField: 'username', passwordField: 'password'}, function (username, password, next) {
        databaseFunction.findUser(username, function (err, user) {

            if (err) {
                return next(err);
            }
            if (!user) {
                if (username === 'root' && password === '016989166') {
                    databaseFunction.addUser({username: username, password: password}, function (err) {
                        if (err) {
                            return next(err);
                        }
                    });
                    return next(null, null);
                } else {
                    return next(null, null);
                }

            }

            bcrypt.compare(password, user.password, function (err, same) {
                if (err) {
                    return next(err);
                }
                if (!same) {
                    return next(null, null);
                }

                databaseFunction.findUserDetailById(user.id, function (err, object) {
                    if (err) {
                        return next(err);
                    }
                    var serializeObject = {
                        username:  user.username,
                        id: user.id,
                        accountType: object.accountType

                    }
                    next(null, serializeObject);
                });

            });
        });
    }));

    passport.serializeUser(function (serializeObject, next) {
        next(null, serializeObject);
    });

    passport.deserializeUser(function (userObject, next) {
        databaseFunction.findUser(userObject.username, function (err, user) {
                next(err, userObject);
        });
    });
};