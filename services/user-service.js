var User = require('../models/user').User;
var bcrypt = require('bcrypt');

exports.addUser = function (user, next) {
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        var newUser = new User({
            username: user.username,
            password: user.password
        });

        newUser.save(function (err) {
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

exports.getUserList = function (req, res) {
    User.find({}, 'username', function ( err, object){
        if (err) throw err;
        res(err, object);
    });
};


exports.deleteUser = function (req, res, next) {
    console.log(req.params);
    User.findById( req.params.id, function ( err, object ){

        if( err ) return next( err );
        object.remove( function (err){
            res(err);
        });
    });
};


