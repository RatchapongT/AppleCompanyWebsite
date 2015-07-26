var User = require('../models/database').User;
var Customer = require('../models/database').Customer;
var bcrypt = require('bcrypt');

exports.addUser = function (user, next) {
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }

        if (user.nickname == '') {
            user.nickname = 'No Name';
        }
        if (user.phone == '') {
            user.phone = '0000000000';
        }
        if (user.lineID == '') {
            user.lineID = 'No LineID';
        }
        user.password = hash;
        var newUser = new User({
            username: user.username,
            password: user.password,
            nickname: user.nickname,
            phone: user.phone,
            accountType: user.accountType,
            lineID: user.lineID
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
    User.find({}, 'username created accountType nickname phone lineID', function (err, object) {
        if (err) throw err;
        res(err, object);
    });
};


exports.deleteUser = function (req, res, next) {
    User.findById(req.params.id, function (err, object) {

        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};


exports.findCustomer = function (customerID, next) {
    Customer.findOne({customerID: customerID}, function (err, customer) {
        next(err, customer);
    });
};

