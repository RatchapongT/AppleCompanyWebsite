




var RecordPage = require('../models/databaseModels').RecordPage;

var Entry = require('../models/databaseModels').Entry;

var async = require('async');

var underscore = require('underscore');

/* USER */






/* CUSTOMER */

exports.findCustomer = function (customerID, next) {
    Customer.findOne({customerID: customerID}, function (err, user) {
        next(err, user);
    });
};

exports.getCustomerTypeList = function (input, next) {
    if (input.malay) {
        Customer.find({malay: true}).deepPopulate(['_workerDetail', '_workerDetail._profileDetail', '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
            if (err) throw err;
            next(err, object);
        });
    } else if (input.thai) {
        Customer.find({thai: true}).deepPopulate(['_workerDetail', '_workerDetail._profileDetail', '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
            if (err) throw err;
            next(err, object);
        });
    } else {
        next(null);
    }
};




/* BANK */






/* RELATIONSHIP WORKER CUSTOMER*/




/* RELATIONSHIP WORKER CUSTOMER*/




/* RECORD */

exports.findRecord = function (input, next) {
    RecordPage.findOne({
        recordDate: input.date,
        recordType: input.recordType
    }, function (err, object) {
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
                        $setOnInsert: {
                            strike: 0,
                            sale: 0,
                            payIn: 0,
                            payOut: 0,
                            balance: 0,
                            payInDetails: [],
                            payOutDetails: []
                        }
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
    Entry.find({
        customer_id: input.requestCustomer_id,
        customerType: input.requestRecordType
    }, function (err, object) {
        if (err) throw err;
        next(err, underscore.sortBy(object, 'recordDate'));
    });
}

exports.getRecordInfo = function (input, next) {
    RecordPage.findOne({
        recordDate: input.date,
        recordType: input.recordType
    }, function (err, object) {
        if (err) throw err;
        next(err, object);
    });
}

exports.updatePayIn = function (input, next) {
    async.waterfall([
        function (callback) {
            SystemBank.findOne({_id: input.requestBankID}, function (err, bankObject) {
                Entry.findOneAndUpdate({
                    recordDate: input.requestDate,
                    customer_id: input.requestCustomerID,
                    customerType: input.customerType
                }, {
                    $push: {
                        "payInDetails": {
                            payIn: input.payIn,
                            paymentMethod_id: bankObject.id,
                            paymentMethodBankName: bankObject.bankName,
                            paymentMethodBankNumber: bankObject.bankNumber,
                            paymentMethodBankType: bankObject.bankType
                        }
                    }
                }, function (err, entryObject) {
                    callback(null, entryObject.id);
                });
            });
        },
        function (entryObjectID, callback) {
            Entry.findOne({
                _id: entryObjectID
            }, function (err, entryObject) {
                callback(null, entryObject);
            });
        },
        function (entryObject, callback) {
            var payInArray = underscore.pluck(entryObject.payInDetails, 'payIn');
            var sum = underscore.reduce(payInArray, function (memo, num) {
                return memo + num;
            }, 0);
            Entry.findOneAndUpdate({
                _id: entryObject.id,
            }, {
                $set: {
                    "payIn": sum
                }
            }, function (err, recordObject) {
                callback(null, 'done');
            });
        }
    ], function (err, result) {
        next(err, result)
    });
}

exports.getEntryPayIn = function (input, next) {
    Entry.find({
        recordDate: input.requestDate,
        customerType: input.requestRecordType
    }, function (err, object) {
        if (err) throw err;
        next(err, object);
    })
}

exports.deletePayIn = function (input, next) {
    async.waterfall([
        function (callback) {
            Entry.findOneAndUpdate({
                _id: input.entry_id
            }, {
                $pull: {
                    "payInDetails": {
                        _id: input.delete_id
                    }
                }
            }, function (err, entryObject) {
                callback(null);
            });
        },
        function (callback) {
            Entry.findOne({
                _id: input.entry_id
            }, function (err, entryObject) {
                callback(null, entryObject);
            });
        },
        function (entryObject, callback) {
            var payInArray = underscore.pluck(entryObject.payInDetails, 'payIn');
            var sum = underscore.reduce(payInArray, function (memo, num) {
                return memo + num;
            }, 0);
            Entry.findOneAndUpdate({
                _id: entryObject.id,
            }, {
                $set: {
                    "payIn": sum
                }
            }, function (err, recordObject) {
                callback(null, 'done');
            });
        }
    ], function (err, recordObject) {
        next(err, recordObject)
    });

}

exports.getCustomerBankList = function (input, next) {
    Bank.find({_customerDetail: input}).populate('_customerDetail').exec(function (err, object) {
        if (err) throw err;
        next(err, object);
    });
};

exports.getEntryPayOut = function (input, next) {
    Entry.find({
        recordDate: input.requestDate,
        customerType: input.requestRecordType
    }, function (err, object) {
        if (err) throw err;
        next(err, object);
    })
}

exports.updatePayOut = function (input, next) {
    async.waterfall([
        function (callback) {
            SystemBank.findOne({_id: input.requestBankID}, function (err, bankObject) {
                Entry.findOneAndUpdate({
                    recordDate: input.requestDate,
                    customer_id: input.requestCustomerID,
                    customerType: input.customerType
                }, {
                    $push: {
                        "payOutDetails": {
                            payOut: input.payOut,
                            paymentMethod_id: bankObject.id,
                            paymentMethodBankName: bankObject.bankName,
                            paymentMethodBankNumber: bankObject.bankNumber,
                            paymentMethodBankType: bankObject.bankType
                        }
                    }
                }, function (err, entryObject) {
                    callback(null, entryObject.id);
                });
            });
        },
        function (entryObjectID, callback) {
            Entry.findOne({
                _id: entryObjectID
            }, function (err, entryObject) {
                callback(null, entryObject);
            });
        },
        function (entryObject, callback) {
            var payOutArray = underscore.pluck(entryObject.payOutDetails, 'payOut');
            var sum = underscore.reduce(payOutArray, function (memo, num) {
                return memo + num;
            }, 0);
            Entry.findOneAndUpdate({
                _id: entryObject.id,
            }, {
                $set: {
                    "payOut": sum
                }
            }, function (err, recordObject) {
                callback(null, 'done');
            });
        }
    ], function (err, result) {
        next(err, result)
    });
}

exports.deletePayOut = function (input, next) {
    async.waterfall([
        function (callback) {
            Entry.findOneAndUpdate({
                _id: input.entry_id
            }, {
                $pull: {
                    "payOutDetails": {
                        _id: input.delete_id
                    }
                }
            }, function (err, entryObject) {
                callback(null);
            });
        },
        function (callback) {
            Entry.findOne({
                _id: input.entry_id
            }, function (err, entryObject) {
                callback(null, entryObject);
            });
        },
        function (entryObject, callback) {
            var payOutArray = underscore.pluck(entryObject.payOutDetails, 'payOut');
            var sum = underscore.reduce(payOutArray, function (memo, num) {
                return memo + num;
            }, 0);
            Entry.findOneAndUpdate({
                _id: entryObject.id,
            }, {
                $set: {
                    "payOut": sum
                }
            }, function (err, recordObject) {
                callback(null, 'done');
            });
        }
    ], function (err, recordObject) {
        next(err, recordObject)
    });

}