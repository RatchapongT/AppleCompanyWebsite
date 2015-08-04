var User = require('../models/databaseModels').User;
var UserDetail = require('../models/databaseModels').UserDetail;
var SystemBank = require('../models/databaseModels').SystemBank;
var Customer = require('../models/databaseModels').Customer;
var WorkerCustomer = require('../models/databaseModels').WorkerCustomer;
var Worker = require('../models/databaseModels').Worker;
var bcrypt = require('bcrypt');

exports.findUser = function (input, next) {
    User.findOne({username: input}, function (err, user) {
        next(err, user);
    });
};

exports.getUserDetailList = function (input, next) {
    UserDetail.find({}).populate('_userDetail', 'username created').exec(function (err, object) {
        next(err, object);
    });
};
exports.addUser = function (input, next) {
    if (input.nickname == '') {
        input.nickname = 'No Name';
    }
    if (input.phone == '') {
        input.phone = '0000000000';
    }
    if (input.lineID == '') {
        input.lineID = 'No LineID';
    }

    if (input.username == 'root') {
        input.nickname = 'No Name';
        input.phone = '0000000000';
        input.lineID = 'No LineID';
        input.accountType = 'Admin';
    }


    bcrypt.hash(input.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }

        input.password = hash;
        var newUser = new User({
            username: input.username,
            password: input.password
        });

        newUser.save(function (err) {
            if (err) {
                return next(err);
            }

            var newUserDetail = new UserDetail({
                _userDetail: newUser._id,
                nickname: input.nickname,
                phone: input.phone,
                accountType: input.accountType,
                lineID: input.lineID
            });

            newUserDetail.save(function (err) {
                if (err) {
                    return next(err);
                }
                if (newUserDetail.accountType === "Manager") {

                    var managerDetail = new Manager({
                        _profileDetail: newUserDetail._id,
                    });
                    managerDetail.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        next(null);
                    });
                }
                if (newUserDetail.accountType === "Worker") {

                    var workerDetail = new Worker({
                        _profileDetail: newUserDetail._id
                    });
                    workerDetail.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        next(null);
                    });

                } else {
                    next(null);
                }

            });

        });
    });
};

exports.deleteUser = function (input, res, next) {
    User.findById(input, function (err, object) {
        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};


exports.findUserDetailById = function (input, next) {
    UserDetail.findOne({_userDetail: input}).populate('_userDetail').exec(function (err, object) {
        next(err, object);
    });
};

exports.editUserProfiles = function (input, next) {
    UserDetail.findByIdAndUpdate(input.editUserID, {
        $set: {
            lineID: input.lineID,
            phone: input.phone,
            nickname: input.nickname
        }
    }, function (err, object) {
        next(err, object);
    });
};

exports.getUnownedCustomerList = function (input, next) {
    Customer.find({_workerDetail: null}, function (err, object) {
        next(err, object);
    });
};
exports.getWorkerList = function (input, next) {
    Worker.find().deepPopulate(['_profileDetail', '_profileDetail._userDetail']).exec(function (err, object) {
        next(err, object);
    });
};

exports.getWorkerCustomerRelationship = function (input, next) {
    WorkerCustomer.find().deepPopulate(['_customerDetail',
        '_customerDetail._workerDetail',
        '_customerDetail._workerDetail._profileDetail',
        '_customerDetail._workerDetail._profileDetail._userDetail',
        '_workerDetail',
        '_workerDetail._profileDetail',
        '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
        next(err, object);
    });
};


exports.assignCustomer = function (input, next) {
    Customer.findByIdAndUpdate(input.customerID, {
        $set: {
            _workerDetail: input.requestWorkerID,
        }
    }, function (err, object) {
        var newWorkerCustomer = new WorkerCustomer({
            _workerDetail: input.requestWorkerID,
            _customerDetail: input.customerID
        });

        newWorkerCustomer.save(function (err) {
            if (err) {
                return next(err);
            }
            next(err, object);
        });
    });
};

exports.deleteWorkerCustomerRelationship = function (input, next) {
    Customer.findByIdAndUpdate(input.customerID, {
        $unset: {
            _workerDetail: 1,
        }
    }, function (err, object) {
        WorkerCustomer.remove({_customerDetail: input.customerID}).exec();
        next(err, object);
    });
};

exports.getSystemBankList = function (input, next) {
    SystemBank.find({}, function (err, object) {
        next(err, object);
    });
};

exports.addSystemBank = function (input, next) {
    var newSystemBank = new SystemBank({
        bankNumber: input.bankNumber,
        bankName: input.bankName,
        bankType: input.bankType
    });

    newSystemBank.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};
exports.deleteSystemBank = function (input, res, next) {
    SystemBank.findById(input, function (err, object) {
        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};