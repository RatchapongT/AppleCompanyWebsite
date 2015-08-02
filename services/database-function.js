var User = require('../models/databaseModels').User;
var UserDetail = require('../models/databaseModels').UserDetail;
var Manager = require('../models/databaseModels').Manager;
var Worker = require('../models/databaseModels').Worker;
var Customer = require('../models/databaseModels').Customer;
var Bank = require('../models/databaseModels').Bank;
var SystemBank = require('../models/databaseModels').SystemBank;
var ManagerWorker = require('../models/databaseModels').ManagerWorker;
var WorkerCustomer = require('../models/databaseModels').WorkerCustomer;

var bcrypt = require('bcrypt');

/* USER */
exports.findUser = function (username, next) {
    User.findOne({username: username}, function (err, user) {
        next(err, user);
    });
};

exports.findUserDetailById = function (id, next) {
    UserDetail.findById(id).populate('_userDetail').exec(function (err, object) {
        next(err, object);
    });
};

exports.getUserDetailList = function (input, next) {
    UserDetail.find({}).populate('_userDetail', 'username created').exec(function (err, object) {
        if (err) throw err;
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

exports.editUserProfiles = function (input, next) {
    UserDetail.findByIdAndUpdate(input.editUserID, {
        $set: {
            lineID: input.lineID,
            phone: input.phone,
            nickname: input.nickname
        }
    }, function (err, object) {
        if (err) throw err;
        next(err, object);
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

/* CUSTOMER */

exports.findCustomer = function (customerID, next) {
    Customer.findOne({customerID: customerID}, function (err, user) {
        next(err, user);
    });
};

exports.getCustomerList = function (input, next) {
    Customer.find().deepPopulate(['_workerDetail', '_workerDetail._profileDetail', '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
        if (err) throw err;
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
        console.log(input);
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
        if (err) throw err;
        next(err, object);
    });
};

/* BANK */

exports.getBankList = function (input, next) {
    Bank.find({}).populate('_customerDetail').exec(function (err, object) {
        if (err) throw err;
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

exports.getSystemBankList = function (input, next) {
    SystemBank.find({} , function (err, object) {
        if (err) throw err;
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

/* RELATIONSHIP WORKER CUSTOMER*/

exports.assignCustomer = function (input, next) {
    Customer.findByIdAndUpdate(input.customerID, {
        $set: {
            _workerDetail: input.requestWorkerID,
        }
    }, function (err, object) {
        if (err) throw err;
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

exports.getUnownedCustomerList = function (input, next) {
    Customer.find({_workerDetail : null}, function (err, object) {
        if (err) throw err;
        next(err, object);

    });
};

exports.deleteWorkerCustomerRelationship = function (input, next) {
    Customer.findByIdAndUpdate(input.customerID, {
        $unset: {
            _workerDetail: 1,
        }
    }, function (err, object) {
        if (err) throw err;
        WorkerCustomer.remove({_customerDetail: input.customerID}).exec();
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
        if (err) throw err;
        next(err, object);
    });
};

exports.getWorkerList = function (input, next) {
    Worker.find().deepPopulate(['_profileDetail', '_profileDetail._userDetail']).exec(function (err, object) {
        if (err) throw err;
        next(err, object);
    });
};

/* RELATIONSHIP WORKER CUSTOMER*/

exports.assignWorker = function (input, next) {
    Worker.findByIdAndUpdate(input.workerID, {
        $set: {
            _managerDetail: input.requestManagerID,
        }
    }, function (err, object) {
        if (err) throw err;
        var newManagerWorker = new ManagerWorker({
            _managerDetail: input.requestManagerID,
            _workerDetail: input.workerID
        });

        newManagerWorker.save(function (err) {
            if (err) {
                return next(err);
            }
            next(err, object);
        });
    });
};

exports.getUnownedWorkerList = function (input, next) {
    Worker.find({_managerDetail : null}).deepPopulate(['_profileDetail', '_profileDetail._userDetail']).exec(function (err, object) {
        if (err) throw err;
        next(err, object);

    });
};

exports.deleteManagerWorkerRelationship = function (input, next) {
    Worker.findByIdAndUpdate(input.workerID, {
        $unset: {
            _managerDetail: 1,
        }
    }, function (err, object) {
        if (err) throw err;
        ManagerWorker.remove({_workerDetail: input.workerID}).exec();
        next(err, object);
    });
};

exports.getManagerWorkerRelationship = function (input, next) {
    ManagerWorker.find().deepPopulate(['_customerDetail',
        '_workerDetail',
        '_workerDetail._profileDetail',
        '_workerDetail._profileDetail._userDetail',
        '_managerDetail',
        '_managerDetail._profileDetail',
        '_managerDetail._profileDetail._userDetail']).exec(function (err, object) {
        if (err) throw err;
        next(err, object);
    });
};

exports.getManagerList = function (input, next) {
    Manager.find().deepPopulate(['_profileDetail', '_profileDetail._userDetail']).exec(function (err, object) {
        if (err) throw err;
        next(err, object);
    });
};