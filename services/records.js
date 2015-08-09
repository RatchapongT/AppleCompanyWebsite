var RecordPage = require('../models/databaseModels').RecordPage;
var Entry = require('../models/databaseModels').Entry;
var ManagerWorker = require('../models/databaseModels').ManagerWorker;
var WorkerCustomer = require('../models/databaseModels').WorkerCustomer;
var WorkerPartner = require('../models/databaseModels').WorkerPartner;
var SystemBank = require('../models/databaseModels').SystemBank;
var Bank = require('../models/databaseModels').Bank;
var Customer = require('../models/databaseModels').Customer;
var async = require('async');
var underscore = require('underscore');

exports.findRecord = function (input, next) {
    RecordPage.findOne({
        recordDate: input.recordDate,
        recordType: input.recordType
    }, function (err, object) {
        next(err, object);
    });
};

exports.createRecord = function (input, next) {
    var sellDetails = [];
    var buyDetails = [];

    async.each(input.customerArray, function (customerData, callback) {
        sellDetails.push({
            customer_id: customerData.customerProfiles.customer_id,
            customerID: customerData.customerProfiles.customerID,
            customerNickname: customerData.customerProfiles.customerNickname,
            strike: 0,
            sale: 0,
            balance: 0
        });
    });

    async.each(input.partnerArray, function (partnerData, callback) {
        buyDetails.push({
            partner_id: partnerData.partnerProfiles.partner_id,
            partnerID: partnerData.partnerProfiles.partnerID,
            partnerNickname: partnerData.partnerProfiles.partnerNickname,
            win: 0,
            buy: 0,
            balance: 0
        });
    });
    var newRecordPage = new RecordPage({
        hierarchy: input.hierarchy,
        recordType: input.recordType,
        recordDate: input.recordDate,
        payInPage: {
            locked: false,
            payInDetails: []
        },
        payOutPage: {
            locked: false,
            payOutDetails: []
        },
        profitLossPage: {
            locked: false,
            sellDetails: sellDetails,
            buyDetails: buyDetails
        },
        totalWin: 0,
        totalBuy: 0,
        totalSale: 0,
        totalStrike: 0,
        totalBalance: 0

    });
    newRecordPage.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};

exports.getHierarchy = function (input, next) {

    formCustomerHierarchy(input, function (err, relationshipModelCustomer) {
        formPartnerHierarchy(input, function (err, relationshipModelPartner) {
            var partnerArray = [];
            var workerArray = [];
            var managerArray = [];
            var customerArray = [];


            var managerGroup = underscore.groupBy(relationshipModelPartner, 'managerUsername');

            var workerGroup = underscore.groupBy(relationshipModelPartner, 'workerUsername');
            var partnerGroup = underscore.groupBy(relationshipModelPartner, 'partnerID');
            var customerGroup = underscore.groupBy(relationshipModelCustomer, 'customerID');


            async.each(partnerGroup, function (partnerGroupData, callback) {
                partnerArray.push(
                    {
                        responsibleWorker: partnerGroupData[0].worker_id,
                        partnerProfiles: {
                            partner_id: partnerGroupData[0].partner_id,
                            partnerID: partnerGroupData[0].partnerID,
                            partnerNickname: partnerGroupData[0].partnerNickname,
                            sale: partnerGroupData[0].sale,
                            strike: partnerGroupData[0].strike
                        }
                    }
                );
            });

            async.each(customerGroup, function (customerGroupData, callback) {
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

            var groupWorker = underscore.groupBy(partnerArray, 'responsibleWorker');

            async.each(workerGroup, function (workerGroupData, callback) {
                async.each(groupWorker, function (groupWorkerData, callback) {
                    if (groupWorkerData[0].responsibleWorker == workerGroupData[0].worker_id) {

                        workerArray.push({
                            customers: [],
                            partners: groupWorkerData,
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

            var groupWorker = underscore.groupBy(customerArray, 'responsibleWorker');


            async.each(workerArray, function (workerArrayData, callback) {
                async.each(groupWorker, function (groupWorkerData, callback) {

                    if (groupWorkerData[0].responsibleWorker.equals(workerArrayData.workerProfiles.worker_id)) {
                        workerArrayData.customers = groupWorkerData;
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
            next(err, {
                hierarchy: managerArray,
                customerArray: customerArray,
                partnerArray: partnerArray
            });

        });
    });

}

var formCustomerHierarchy = function (input, next) {
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
                    var _worker_id = workerCustomerData._workerDetail._id;
                    var _workerUsername = workerCustomerData._workerDetail._profileDetail._userDetail.username;
                    var _workerNickname = workerCustomerData._workerDetail._profileDetail.nickname;
                    var _customer_id = workerCustomerData._customerDetail._id;
                    var _customerID = workerCustomerData._customerDetail.customerID;
                    var _customerNickname = workerCustomerData._customerDetail.nickname;
                    var _customerMalay = workerCustomerData._customerDetail.malay;
                    var _customerThai = workerCustomerData._customerDetail.thai;
                    var _manager_id = managerWorkerData._managerDetail._id;
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
        }

    ], function (err, result) {
        next(err, result);
    });
}
var formPartnerHierarchy = function (input, next) {
    var relationshipModel = [];
    async.waterfall([
        function (callback) {
            ManagerWorker.find().deepPopulate(['_partnerDetail',
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
            WorkerPartner.find().deepPopulate(['_partnerDetail',
                '_partnerDetail._workerDetail',
                '_partnerDetail._workerDetail._profileDetail',
                '_partnerDetail._workerDetail._profileDetail._userDetail',
                '_workerDetail',
                '_workerDetail._profileDetail',
                '_workerDetail._profileDetail._userDetail']).exec(function (err, workerPartnerObject) {
                if (err) throw err;

                callback(null, managerWorkerObject, workerPartnerObject);
            });
        },

        function (managerWorkerObject, workerPartnerObject, callback) {
            async.each(managerWorkerObject, function (managerWorkerData, callback) {
                async.each(workerPartnerObject, function (workerPartnerData, callback) {
                    var _worker_id = workerPartnerData._workerDetail._id;
                    var _workerUsername = workerPartnerData._workerDetail._profileDetail._userDetail.username;
                    var _workerNickname = workerPartnerData._workerDetail._profileDetail.nickname;
                    var _partner_id = workerPartnerData._partnerDetail._id;
                    var _partnerID = workerPartnerData._partnerDetail.partnerID;
                    var _partnerNickname = workerPartnerData._partnerDetail.nickname;
                    var _partnerMalay = workerPartnerData._partnerDetail.malay;
                    var _partnerThai = workerPartnerData._partnerDetail.thai;
                    var _manager_id = managerWorkerData._managerDetail._id;
                    var _managerUsername = managerWorkerData._managerDetail._profileDetail._userDetail.username;
                    var _managerNickname = managerWorkerData._managerDetail._profileDetail.nickname;

                    if (workerPartnerData._workerDetail._profileDetail._id.equals(managerWorkerData._workerDetail._profileDetail._id)) {
                        if (_partnerMalay && input.partnerType == 'Malay') {
                            relationshipModel.push(
                                {
                                    manager_id: _manager_id,
                                    managerUsername: _managerUsername,
                                    managerNickname: _managerNickname,
                                    worker_id: _worker_id,
                                    workerUsername: _workerUsername,
                                    workerNickname: _workerNickname,
                                    partner_id: _partner_id,
                                    partnerID: _partnerID,
                                    partnerNickname: _partnerNickname,
                                    partnerType: 'Malay'
                                }
                            );

                        }

                        if (_partnerThai && input.partnerType == 'Thai') {
                            relationshipModel.push(
                                {
                                    manager_id: _manager_id,
                                    managerUsername: _managerUsername,
                                    managerNickname: _managerNickname,
                                    worker_id: _worker_id,
                                    workerUsername: _workerUsername,
                                    workerNickname: _workerNickname,
                                    partner_id: _partner_id,
                                    partnerID: _partnerID,
                                    partnerNickname: _partnerNickname,
                                    partnerType: 'Thai'
                                }
                            );
                        }
                    }
                });
            });
            callback(null, relationshipModel);
        }
    ], function (err, result) {
        next(err, result);
    });
}


exports.updateRecord = function (input, next) {
    var totalStrike = underscore.reduce(input.strike, function (store, num) {
        return store + Number(num);
    }, 0);
    var totalSale = underscore.reduce(input.sale, function (store, num) {
        return store + Number(num);
    }, 0);
    var totalWin = underscore.reduce(input.win, function (store, num) {
        return store + Number(num);
    }, 0);
    var totalBuy = underscore.reduce(input.buy, function (store, num) {
        return store + Number(num);
    }, 0);

    async.each(input.sellDetails_id, function (sellDetails_id, callback) {


        var index = input.sellDetails_id.indexOf(sellDetails_id);
        RecordPage.update({
            recordDate: input.recordDate,
            recordType: input.recordType,
            'profitLossPage.sellDetails._id': input.sellDetails_id[index]
        }, {
            $set: {
                'profitLossPage.sellDetails.$.strike': input.strike[index],
                'profitLossPage.sellDetails.$.sale': input.sale[index],
                'profitLossPage.sellDetails.$.balance': input.sale[index] - input.strike[index]
            }
        }, function (err, result) {
            if (err) {
                next(err);
            }
        });
    });

    async.each(input.buyDetails_id, function (buyDetails_id, callback) {
        var index = input.buyDetails_id.indexOf(buyDetails_id);
        RecordPage.update({
            recordDate: input.recordDate,
            recordType: input.recordType,
            'profitLossPage.buyDetails._id': input.buyDetails_id[index]
        }, {
            $set: {
                'profitLossPage.buyDetails.$.win': input.win[index],
                'profitLossPage.buyDetails.$.buy': input.buy[index],
                'profitLossPage.buyDetails.$.balance': input.win[index] - input.buy[index]
            }
        }, function (err, result) {
            if (err) {
                next(err);
            }
        });
    });

    RecordPage.update({
        recordDate: input.recordDate,
        recordType: input.recordType,
    }, {
        $set: {
            totalStrike: totalStrike,
            totalSale: totalSale,
            totalWin: totalWin,
            totalBuy: totalBuy,
            totalBalance: totalSale + totalWin - totalBuy - totalStrike
        }
    }, function (err, result) {
        if (err) {
            next(err);
        }
        next(null);
    });


}

exports.lockProfitLossPage = function (input, next) {
    RecordPage.update({
        recordDate: input.requestDate,
        recordType: input.requestRecordType,
    }, {
        $set: {
            'profitLossPage.locked': input.locked
        }
    }, function (err, result) {
        if (err) {
            next(err);
        }
        next(null);
    });
}

exports.lockPayOutPage = function (input, next) {
    RecordPage.update({
        recordDate: input.requestDate,
        recordType: input.requestRecordType,
    }, {
        $set: {
            'payOutPage.locked': input.locked
        }
    }, function (err, result) {
        if (err) {
            next(err);
        }
        next(null);
    });
}
exports.getUniqueSystemBank = function (input, next) {
    SystemBank.find().distinct('bankType', function (err, object) {
        if (err) {
            next(err);
        }
        next(err, object);
    });
}
exports.getUniqueBank = function (input, next) {
    Bank.find().distinct('bankType', function (err, object) {
        if (err) {
            next(err);
        }
        next(err, object);
    });
}
exports.updatePayOut = function (input, next) {

    Bank.find({_ownerDetail: input.user_id}, function (err, bankObject) {
        if (err) {
            next(err);
        }
        RecordPage.update({
            recordDate: input.requestDate,
            recordType: input.requestRecordType,
        }, {
            $push: {
                'payOutPage.payOutDetails': {
                    reportedUsername: input.reportedUsername,
                    reportedUserNickname: input.reportedUserNickname,
                    user_id: input.user_id,
                    bank: bankObject,
                    otherBank: {
                        bankNumber: input.bankNumber,
                        bankName: input.bankName,
                        bankType: input.bankType
                    },
                    userID: input.userID,
                    userNickname: input.userNickname,
                    payOut: input.payOut,
                    paymentMethodBankID: "",
                    paymentMethodBankName: "",
                    paymentMethodBankNumber: "",
                    paymentMethodBankType: "",
                    approved: false,
                }
            }
        }, function (err, result) {
            if (err) {
                next(err);
            }
            next(null);
        });
    });
}

exports.updatePayIn = function (input, next) {

    RecordPage.update({
        recordDate: input.requestDate,
        recordType: input.requestRecordType,
    }, {
        $push: {
            'payInPage.payInDetails': {
                reportedUsername: input.reportedUsername,
                reportedUserNickname: input.reportedUserNickname,
                user_id: input.user_id,
                userID: input.userID,
                userNickname: input.userNickname,
                payIn: input.payIn,
                paymentMethodBankName: input.paymentMethodBankName,
                paymentMethodBankNumber: input.paymentMethodBankNumber,
                paymentMethodBankType: input.paymentMethodBankType
            }
        }
    }, function (err, result) {
        if (err) {
            next(err);
        }
        next(null);
    });
}

exports.deletePayOut = function (input, next) {
    RecordPage.update({
        recordDate: input.requestDate,
        recordType: input.requestRecordType
    }, {
        $pull: {
            'payOutPage.payOutDetails': {
                _id: input.payOutID
            }
        }
    }, function (err, result) {
        if (err) {
            next(err);
        }
        next(null);
    });
}

exports.deletePayIn = function (input, next) {
    RecordPage.update({
        recordDate: input.requestDate,
        recordType: input.requestRecordType
    }, {
        $pull: {
            'payInPage.payInDetails': {
                _id: input.payInID
            }
        }
    }, function (err, result) {
        if (err) {
            next(err);
        }
        next(null);
    });
}

exports.lockPayInPage = function (input, next) {
    RecordPage.update({
        recordDate: input.requestDate,
        recordType: input.requestRecordType,
    }, {
        $set: {
            'payInPage.locked': input.locked
        }
    }, function (err, result) {
        if (err) {
            next(err);
        }
        next(null);
    });
}
exports.getSystemBankList = function (input, next) {
    SystemBank.find({}, function (err, object) {
        next(err, object);
    });
};

exports.approvePayOut = function (input, next) {

    if (typeof (input.json_bank) == 'string') {
        input.json_bank = [input.json_bank];
        input.payOutDetailsID = [input.payOutDetailsID];
    }
    async.each(input.payOutDetailsID, function (payOutDetailsID, callback) {

        var index = input.payOutDetailsID.indexOf(payOutDetailsID);
        if (JSON.parse(input.json_bank[index]).id != 'unapproved') {
            RecordPage.update({
                recordDate: input.requestDate,
                recordType: input.requestRecordType,
                'payOutPage.payOutDetails._id': input.payOutDetailsID[index]
            }, {
                $set: {
                    'payOutPage.payOutDetails.$.paymentMethodBankID': JSON.parse(input.json_bank[index]).id,
                    'payOutPage.payOutDetails.$.paymentMethodBankName': JSON.parse(input.json_bank[index]).bankName,
                    'payOutPage.payOutDetails.$.paymentMethodBankNumber': JSON.parse(input.json_bank[index]).bankNumber,
                    'payOutPage.payOutDetails.$.paymentMethodBankType': JSON.parse(input.json_bank[index]).bankType,
                    'payOutPage.payOutDetails.$.approved': true
                }
            }, function (err, result) {
                if (err) {
                    next(err);
                }
            });
        }

    });
    next(null);
};

exports.unapprovePayOut = function (input, next) {
    var requestRecordType = (input.recordType).charAt(0).toUpperCase() + (input.recordType).substring(1).toLowerCase();
    RecordPage.update({
        recordDate: input.date,
        recordType: requestRecordType,
        'payOutPage.payOutDetails._id': input.payOutID
    }, {
        $set: {
            'payOutPage.payOutDetails.$.approved': false
        }
    }, function (err, result) {
        if (err) {
            next(err);
        }
    });
    next(null);
};

exports.getCentralSheetPartner = function (input, next) {
    var requestRecordType = (input.recordType).charAt(0).toUpperCase() + (input.recordType).substring(1).toLowerCase();
    console.log(input.requestID);
    var financialObject = []
    RecordPage.find({
        recordType: requestRecordType
    }, function (err, object) {
        if (err) {
            next(err);

        }

        async.each(object, function (objectData, callback) {
            var index = object.indexOf(objectData);
            var profitLossPage = underscore.findWhere(object[index].profitLossPage.buyDetails, {partner_id: input.requestID.toString()})
            var payOutPage = underscore.where(object[index].payOutPage.payOutDetails, {user_id: input.requestID.toString(), approved: true})
            var payOutArray = underscore.pluck(payOutPage, 'payOut');
            var payOutSum = underscore.reduce(payOutArray, function(memo, num){ return memo + num; }, 0);
            var payInPage = underscore.where(object[index].payInPage.payInDetails, {user_id: input.requestID.toString()})
            var payInArray = underscore.pluck(payInPage, 'payIn');
            var payInSum = underscore.reduce(payInArray, function(memo, num){ return memo + num; }, 0);
            financialObject.push({
                recordDate: object[index].recordDate,
                buy: profitLossPage.buy,
                win : profitLossPage.win,
                payOut : payOutSum,
                payIn: payInSum
            })
        });

        var sortedObject = underscore.sortBy(financialObject, 'recordDate')
        next(err, sortedObject);
    })
}



exports.getCentralSheetCustomer = function (input, next) {
    var requestRecordType = (input.recordType).charAt(0).toUpperCase() + (input.recordType).substring(1).toLowerCase();
    var financialObject = []
    RecordPage.find({
        recordType: requestRecordType
    }, function (err, object) {
        if (err) {
            next(err);

        }

        async.each(object, function (objectData, callback) {
            var index = object.indexOf(objectData);
            var profitLossPage = underscore.findWhere(object[index].profitLossPage.sellDetails, {customer_id: input.requestID.toString()})
            var payOutPage = underscore.where(object[index].payOutPage.payOutDetails, {user_id: input.requestID.toString(), approved: true})
            var payOutArray = underscore.pluck(payOutPage, 'payOut');
            var payOutSum = underscore.reduce(payOutArray, function(memo, num){ return memo + num; }, 0);
            var payInPage = underscore.where(object[index].payInPage.payInDetails, {user_id: input.requestID.toString()})
            var payInArray = underscore.pluck(payInPage, 'payIn');
            var payInSum = underscore.reduce(payInArray, function(memo, num){ return memo + num; }, 0);
            financialObject.push({
                recordDate: object[index].recordDate,
                strike: profitLossPage.strike,
                sale : profitLossPage.sale,
                payOut : payOutSum,
                payIn: payInSum
            })
        });

        var sortedObject = underscore.sortBy(financialObject, 'recordDate')
        next(err, sortedObject);
    })
}

exports.getAllRecord = function (input, next) {

    RecordPage.find({}, function (err, object) {
        if (err) {
            next(err);

        }
        next(err, object);
    })
}