var Customer = require('../models/databaseModels').Customer;
var Bank = require('../models/databaseModels').Bank;
var Worker = require('../models/databaseModels').Worker;

exports.getCustomerList = function (input, next) {
    Customer.find().deepPopulate(['_workerDetail', '_workerDetail._profileDetail', '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
        next(err, object);
    });
};

exports.getCustomerListLimited = function (input, next) {
        Customer.find({_workerDetail : input}).deepPopulate(['_workerDetail', '_workerDetail._profileDetail', '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
            next(err, object);
        });
};

exports.addCustomer = function (input, next) {
    if (input.nickname == '') {
        input.nickname = 'No Name';
    }
    if (input.phone == '') {
        input.phone = '0000000000';
    }
    if (input.lineID == '') {
        input.lineID = 'No LineID';
    }
    if (input.percent == '') {
        input.percent = 0;
    }
    var newCustomer = new Customer({
        customerID: input.customerID,
        nickname: input.nickname,
        phone: input.phone,
        paymentCondition: input.paymentCondition,
        thai: input.thai,
        malay: input.malay,
        percent: input.percent,
        lineID: input.lineID
    });

    newCustomer.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};
exports.deleteCustomer = function (input, res, next) {
    Customer.findById(input, function (err, object) {
        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};
exports.getBankList = function (input, next) {
    Bank.find({_customerDetail: input}).populate('_customerDetail').exec(function (err, object) {
        next(err, object);
    });
};


exports.addBank = function (input, next) {
    var newBank = new Bank({
        _customerDetail: input.customerID,
        bankNumber: input.bankNumber,
        bankName: input.bankName,
        bankType: input.bankType
    });

    newBank.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};
exports.deleteBank = function (input, res, next) {
    Bank.findById(input, function (err, object) {
        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};

exports.editCustomerProfiles = function (input, next) {
    Customer.findByIdAndUpdate(input.editCustomerID, {
        $set: {
            malay: input.malay,
            thai: input.thai,
            nickname: input.nickname,
            phone: input.phone,
            lineID: input.lineID,
            percent: input.percent,
            paymentCondition: input.paymentCondition
        }
    }, function (err, object) {
        next(err, object);
    });
};

exports.findCustomer = function (input, next) {
    Customer.findOne({customerID: input}, function (err, user) {
        next(err, user);
    });
};