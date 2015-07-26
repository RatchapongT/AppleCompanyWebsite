var User = require('../models/database').User;
var Customer = require('../models/database').Customer;
var Bank = require('../models/database').Bank;
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

exports.getCustomerList = function (req, res) {
    Customer.find({}, 'paymentCondition customerID percent created nickname phone lineID malay thai', function (err, object) {
        if (err) throw err;
        res(err, object);
    });
};
exports.addCustomer = function (customer, next) {

    if (customer.nickname == '') {
        customer.nickname = 'No Name';
    }
    if (customer.phone == '') {
        customer.phone = '0000000000';
    }
    if (customer.lineID == '') {
        customer.lineID = 'No LineID';
    }
    if (customer.percent == '') {
        customer.percent = 0;
    }
    var newCustomer = new Customer({
        customerID: customer.customerID,
        nickname: customer.nickname,
        phone: customer.phone,
        paymentCondition: customer.paymentCondition,
        thai: customer.thai,
        malay: customer.malay,
        percent: customer.percent,
        lineID: customer.lineID
    });

    newCustomer.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};

exports.deleteCustomer = function (req, res, next) {
    Customer.findById(req.params.id, function (err, object) {

        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};

exports.addCustomerBank = function (req, res, next) {




};

