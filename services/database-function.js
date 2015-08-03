var User = require('../models/databaseModels').User;
var UserDetail = require('../models/databaseModels').UserDetail;
var Manager = require('../models/databaseModels').Manager;
var Worker = require('../models/databaseModels').Worker;
var Customer = require('../models/databaseModels').Customer;
var Bank = require('../models/databaseModels').Bank;
var SystemBank = require('../models/databaseModels').SystemBank;
var ManagerWorker = require('../models/databaseModels').ManagerWorker;
var RecordPage = require('../models/databaseModels').RecordPage;
var WorkerCustomer = require('../models/databaseModels').WorkerCustomer;
var Entry = require('../models/databaseModels').Entry;

var async = require('async');
var bcrypt = require('bcrypt');
var underscore = require('underscore');

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
    SystemBank.find({}, function (err, object) {
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
    Customer.find({_workerDetail: null}, function (err, object) {
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
    Worker.find({_managerDetail: null}).deepPopulate(['_profileDetail', '_profileDetail._userDetail']).exec(function (err, object) {
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


/* RECORD */

exports.findRecord = function (input, next) {
    RecordPage.findOne({
        recordDate: input.date,
        recordType: input.recordType
    }, function (err, object) {
        if (err) throw err;
        next(err, object);
    });
};

exports.findRecordByID = function (input, next) {
    RecordPage.findById(input
        , function (err, object) {
            if (err) throw err;
            next(err, object);
        });
};

exports.initializeRecord = function (input, next) {

    var newRecordPage = new RecordPage({
        recordDate: input.date,
        recordType: input.recordType
    });

    newRecordPage.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};

exports.lockPage = function (input, next) {

    RecordPage.findOneAndUpdate({_id: input.recordPageID}, {
        $set: {
            locked: input.locked
        }
    }, function (err, object) {

        if (err) throw err;
        next(null, object);
    });
};
exports.createEntry = function (input, next) {
    var relationshipModel = [];
    async.waterfall([
        function (callback) {
            ManagerWorker.find().deepPopulate(['_customerDetail',
                '_workerDetail',
                '_workerDetail._profileDetail',
                '_workerDetail._profileDetail._userDetail',
                '_managerDetail',
                '_managerDetail._profileDetail',
                '_managerDetail._profileDetail._userDetail']).exec(function (err, managerWorkerObject) {
                if (err) throw err;
                callback(null, managerWorkerObject);
            });
        },
        function (managerWorkerObject, callback) {
            WorkerCustomer.find().deepPopulate(['_customerDetail',
                '_customerDetail._workerDetail',
                '_customerDetail._workerDetail._profileDetail',
                '_customerDetail._workerDetail._profileDetail._userDetail',
                '_workerDetail',
                '_workerDetail._profileDetail',
                '_workerDetail._profileDetail._userDetail']).exec(function (err, workerCustomerObject) {
                if (err) throw err;
                callback(null, managerWorkerObject, workerCustomerObject);
            });
        },

        function (managerWorkerObject, workerCustomerObject, callback) {

            async.each(managerWorkerObject, function (managerWorkerData, callback) {
                async.each(workerCustomerObject, function (workerCustomerData, callback) {
                    var _worker_id = workerCustomerData._workerDetail._profileDetail._id;
                    var _workerUsername = workerCustomerData._workerDetail._profileDetail._userDetail.username;
                    var _workerNickname = workerCustomerData._workerDetail._profileDetail.nickname;
                    var _customer_id = workerCustomerData._customerDetail._id;
                    var _customerID = workerCustomerData._customerDetail.customerID;
                    var _customerNickname = workerCustomerData._customerDetail.nickname;
                    var _customerMalay = workerCustomerData._customerDetail.malay;
                    var _customerThai = workerCustomerData._customerDetail.thai;


                    var _manager_id = managerWorkerData._managerDetail._profileDetail._id;
                    var _managerUsername = managerWorkerData._managerDetail._profileDetail._userDetail.username;
                    var _managerNickname = managerWorkerData._managerDetail._profileDetail.nickname;


                    if (workerCustomerData._workerDetail._profileDetail._id.equals(managerWorkerData._workerDetail._profileDetail._id)) {


                        if (_customerMalay && input.customerType == 'Malay') {
                            relationshipModel.push(
                                {
                                    manager_id: _manager_id,
                                    managerUsername: _managerUsername,
                                    managerNickname: _managerNickname,
                                    worker_id: _worker_id,
                                    workerUsername: _workerUsername,
                                    workerNickname: _workerNickname,
                                    customer_id: _customer_id,
                                    customerID: _customerID,
                                    customerNickname: _customerNickname,
                                    customerType: 'Malay'
                                }
                            );

                        }

                        if (_customerThai && input.customerType == 'Thai') {
                            relationshipModel.push(
                                {
                                    manager_id: _manager_id,
                                    managerUsername: _managerUsername,
                                    managerNickname: _managerNickname,
                                    worker_id: _worker_id,
                                    workerUsername: _workerUsername,
                                    workerNickname: _workerNickname,
                                    customer_id: _customer_id,
                                    customerID: _customerID,
                                    customerNickname: _customerNickname,
                                    customerType: 'Thai'
                                }
                            );
                        }

                    }


                });
            });


            callback(null, relationshipModel);
        },

        function (relationshipModel, callback) {
            async.each(relationshipModel, function (relationshipModelData, callback) {
                Entry.findOneAndUpdate({
                        _recordDetail: input.recordPageID,
                        recordDate: input.date,
                        manager_id: relationshipModelData.manager_id,
                        customer_id: relationshipModelData.customer_id,
                        worker_id: relationshipModelData.worker_id,
                        customerType: relationshipModelData.customerType
                    }, {
                        $set: {
                            _recordDetail: input.recordPageID,
                            recordDate: input.date,
                            manager_id: relationshipModelData.manager_id,
                            customer_id: relationshipModelData.customer_id,
                            worker_id: relationshipModelData.worker_id,
                            managerUsername: relationshipModelData.managerUsername,
                            managerNickname: relationshipModelData.managerNickname,
                            customerID: relationshipModelData.customerID,
                            customerNickname: relationshipModelData.customerNickname,
                            workerUsername: relationshipModelData.workerUsername,
                            workerNickname: relationshipModelData.workerNickname,
                            customerType: relationshipModelData.customerType
                        },
                        $setOnInsert: {strike: 0, sale: 0}
                    }
                    , {upsert: true}, function (err, object) {
                        if (err) {
                            return res.send(err);
                        }
                    });
            });
            callback(null, 'done');
        }
    ], function (err, result) {
        next();
    });
};

exports.findEntry = function (input, next) {

    Entry.find({
        recordDate: input.date,
        customerType: input.customerType
    }).populate('_recordDetail').exec(function (err, object) {


        var customerArray = [];
        var workerArray = [];
        var managerArray = [];
        var totalPageSale = 0;
        var totalPageStrike = 0;
        var managerGroup = underscore.groupBy(object, 'managerUsername');
        var workerGroup = underscore.groupBy(object, 'workerUsername');
        var customerGroup = underscore.groupBy(object, 'customerID');

        async.each(customerGroup, function (customerGroupData, callback) {
            totalPageStrike = totalPageStrike + customerGroupData[0].strike;
            totalPageSale = totalPageSale + customerGroupData[0].sale;
            customerArray.push(
                {
                    responsibleWorker: customerGroupData[0].worker_id,
                    customerProfiles: {
                        customer_id: customerGroupData[0].customer_id,
                        customerID: customerGroupData[0].customerID,
                        customerNickname: customerGroupData[0].customerNickname,
                        sale: customerGroupData[0].sale,
                        strike: customerGroupData[0].strike
                    }
                }
            );
        });

        var groupWorker = underscore.groupBy(customerArray, 'responsibleWorker');

        async.each(workerGroup, function (workerGroupData, callback) {
            async.each(groupWorker, function (groupWorkerData, callback) {
                if (groupWorkerData[0].responsibleWorker == workerGroupData[0].worker_id) {

                    workerArray.push({
                        customers: groupWorkerData,
                        responsibleManager: workerGroupData[0].manager_id,
                        workerProfiles: {
                            worker_id: workerGroupData[0].worker_id,
                            workerUsername: workerGroupData[0].workerUsername,
                            workerNickname: workerGroupData[0].workerNickname
                        }

                    });
                }

            });
        });

        var groupManager = underscore.groupBy(workerArray, 'responsibleManager');

        async.each(managerGroup, function (managerGroupData, callback) {
            async.each(groupManager, function (groupManagerData, callback) {
                if (groupManagerData[0].responsibleManager == managerGroupData[0].manager_id) {

                    managerArray.push({
                        workers: groupManagerData,
                        managerProfiles: {
                            manager_id: managerGroupData[0].manager_id,
                            managerUsername: managerGroupData[0].managerUsername,
                            managerNickname: managerGroupData[0].managerNickname
                        }

                    });
                }

            });
        });

        RecordPage.update({
            recordDate: input.date,
            recordType: input.customerType
        }, {
            $set: {
                totalSale: totalPageSale,
                totalStrike: totalPageStrike
            }
        }, function (err) {
            next(err, managerArray);
        });
    });
};

exports.updateEntry = function (input, next) {
    if (typeof(input.customer_id) === 'object') {
        async.each(input.customer_id, function (customer_id, callback) {
            var index = input.customer_id.indexOf(customer_id)
            Entry.findOneAndUpdate({
                _recordDetail: input.recordPageID,
                recordDate: input.date,
                customer_id: input.customer_id[index],
                customerType: input.customerType
            }, {
                $set: {
                    strike: input.strike[index],
                    sale: input.sale[index],
                }
            }, function (err, object) {
                if (err) throw err;
            });
        });
        next(null);
    } else if (typeof(input.customer_id) === 'string') {
        Entry.findOneAndUpdate({
            _recordDetail: input.recordPageID,
            recordDate: input.date,
            customer_id: input.customer_id,
            customerType: input.customerType
        }, {
            $set: {
                strike: input.strike,
                sale: input.sale
            }
        }, function (err, object) {
            if (err) throw err;

            next(null, object);
        });
    } else {
        next(null);
    }

}


exports.getCustomerFinancialHistory = function (input, next) {
    Entry.find({customer_id : input}, function(err, object) {
       if (err) throw err;
        next(err, underscore.sortBy(object, 'recordDate'));
    });
}