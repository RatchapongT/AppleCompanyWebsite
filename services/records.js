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


exports.getCustomerHierarchy = function (input, next) {
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
        },
        function (relationshipModel, callback) {

            var customerArray = [];
            var workerArray = [];
            var managerArray = [];

            var managerGroup = underscore.groupBy(relationshipModel, 'managerUsername');
            var workerGroup = underscore.groupBy(relationshipModel, 'workerUsername');
            var customerGroup = underscore.groupBy(relationshipModel, 'customerID');

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
            callback(null, {customerHierarchy: managerArray, customerArray : customerArray});
        }

    ], function (err, result) {
        next(err, result);
    });
}

exports.getPartnerHierarchy = function (input, next) {
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
        },
        function (relationshipModel, callback) {

            var partnerArray = [];
            var workerArray = [];
            var managerArray = [];

            var managerGroup = underscore.groupBy(relationshipModel, 'managerUsername');
            var workerGroup = underscore.groupBy(relationshipModel, 'workerUsername');
            var partnerGroup = underscore.groupBy(relationshipModel, 'partnerID');

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

            var groupWorker = underscore.groupBy(partnerArray, 'responsibleWorker');

            async.each(workerGroup, function (workerGroupData, callback) {
                async.each(groupWorker, function (groupWorkerData, callback) {
                    if (groupWorkerData[0].responsibleWorker == workerGroupData[0].worker_id) {

                        workerArray.push({
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



            callback(null, {partnerHierarchy: managerArray, partnerArray : partnerArray});
        }

    ], function (err, result) {
        next(err, result);
    });
}

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
            strike: 0,
            sale: 0,
            balance: 0
        });
    });
    var newRecordPage = new RecordPage({
        hierarchy:input.hierarchy,
        recordType: input.recordType,
        recordDate: input.recordDate,
        payInPage: {
            locked: false,
            payInDetails: []
        },
        payOutPage: {
            locked: false,
            payInDetails: []
        },
        profitLossPage: {
            locked: false,
            sellDetails: sellDetails,
            buyDetails: buyDetails
        },
        totalSellSale:  0,
        totalSellStrike: 0,
        totalBuySale: 0,
        totalBuyStrike: 0,
        totalBalance: 0,
    });
        newRecordPage.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};

exports.getHierarchy = function (input , next) {

    formCustomerHierarchy(input, function(err, relationshipModelCustomer) {
        formPartnerHierarchy(input, function(err, relationshipModelPartner) {
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
            next(err, {hierarchy: managerArray, customerArray : customerArray, partnerArray : partnerArray});

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
//exports.initializeRecord = function (input, next) {
//
//    var newRecordPage = new RecordPage({
//        recordDate: input.date,
//        recordType: input.recordType
//    });
//
//    newRecordPage.save(function (err) {
//        if (err) {
//            return next(err);
//        }
//        next(null);
//    });
//};





//
//exports.initializeRecord = function (input, next) {
//
//    var newRecordPage = new RecordPage({
//        recordDate: input.date,
//        recordType: input.recordType
//    });
//
//    newRecordPage.save(function (err) {
//        if (err) {
//            return next(err);
//        }
//        next(null);
//    });
//};
//
//exports.createEntry = function (input, next) {
//    var relationshipModel = [];
//    async.waterfall([
//        function (callback) {
//            ManagerWorker.find().deepPopulate(['_customerDetail',
//                '_workerDetail',
//                '_workerDetail._profileDetail',
//                '_workerDetail._profileDetail._userDetail',
//                '_managerDetail',
//                '_managerDetail._profileDetail',
//                '_managerDetail._profileDetail._userDetail']).exec(function (err, managerWorkerObject) {
//                if (err) throw err;
//
//                callback(null, managerWorkerObject);
//            });
//        },
//        function (managerWorkerObject, callback) {
//            WorkerCustomer.find().deepPopulate(['_customerDetail',
//                '_customerDetail._workerDetail',
//                '_customerDetail._workerDetail._profileDetail',
//                '_customerDetail._workerDetail._profileDetail._userDetail',
//                '_workerDetail',
//                '_workerDetail._profileDetail',
//                '_workerDetail._profileDetail._userDetail']).exec(function (err, workerCustomerObject) {
//                if (err) throw err;
//
//                callback(null, managerWorkerObject, workerCustomerObject);
//            });
//        },
//
//        function (managerWorkerObject, workerCustomerObject, callback) {
//            async.each(managerWorkerObject, function (managerWorkerData, callback) {
//                async.each(workerCustomerObject, function (workerCustomerData, callback) {
//                    var _worker_id = workerCustomerData._workerDetail._id;
//                    var _workerUsername = workerCustomerData._workerDetail._profileDetail._userDetail.username;
//                    var _workerNickname = workerCustomerData._workerDetail._profileDetail.nickname;
//                    var _customer_id = workerCustomerData._customerDetail._id;
//                    var _customerID = workerCustomerData._customerDetail.customerID;
//                    var _customerNickname = workerCustomerData._customerDetail.nickname;
//                    var _customerMalay = workerCustomerData._customerDetail.malay;
//                    var _customerThai = workerCustomerData._customerDetail.thai;
//
//
//                    var _manager_id = managerWorkerData._managerDetail._id;
//                    var _managerUsername = managerWorkerData._managerDetail._profileDetail._userDetail.username;
//                    var _managerNickname = managerWorkerData._managerDetail._profileDetail.nickname;
//
//
//                    if (workerCustomerData._workerDetail._profileDetail._id.equals(managerWorkerData._workerDetail._profileDetail._id)) {
//                        if (_customerMalay && input.customerType == 'Malay') {
//                            relationshipModel.push(
//                                {
//                                    manager_id: _manager_id,
//                                    managerUsername: _managerUsername,
//                                    managerNickname: _managerNickname,
//                                    worker_id: _worker_id,
//                                    workerUsername: _workerUsername,
//                                    workerNickname: _workerNickname,
//                                    customer_id: _customer_id,
//                                    customerID: _customerID,
//                                    customerNickname: _customerNickname,
//                                    customerType: 'Malay'
//                                }
//                            );
//
//                        }
//
//                        if (_customerThai && input.customerType == 'Thai') {
//                            relationshipModel.push(
//                                {
//                                    manager_id: _manager_id,
//                                    managerUsername: _managerUsername,
//                                    managerNickname: _managerNickname,
//                                    worker_id: _worker_id,
//                                    workerUsername: _workerUsername,
//                                    workerNickname: _workerNickname,
//                                    customer_id: _customer_id,
//                                    customerID: _customerID,
//                                    customerNickname: _customerNickname,
//                                    customerType: 'Thai'
//                                }
//                            );
//                        }
//
//                    }
//
//
//                });
//            });
//
//
//            callback(null, relationshipModel);
//        },
//
//        function (relationshipModel, callback) {
//
//            async.each(relationshipModel, function (relationshipModelData, callback) {
//                Entry.findOneAndUpdate({
//                        _recordDetail: input.recordPageID,
//                        recordDate: input.date,
//                        manager_id: relationshipModelData.manager_id,
//                        customer_id: relationshipModelData.customer_id,
//                        worker_id: relationshipModelData.worker_id,
//                        customerType: relationshipModelData.customerType
//                    }, {
//                        $set: {
//                            _recordDetail: input.recordPageID,
//                            recordDate: input.date,
//                            manager_id: relationshipModelData.manager_id,
//                            customer_id: relationshipModelData.customer_id,
//                            worker_id: relationshipModelData.worker_id,
//                            managerUsername: relationshipModelData.managerUsername,
//                            managerNickname: relationshipModelData.managerNickname,
//                            customerID: relationshipModelData.customerID,
//                            customerNickname: relationshipModelData.customerNickname,
//                            workerUsername: relationshipModelData.workerUsername,
//                            workerNickname: relationshipModelData.workerNickname,
//                            customerType: relationshipModelData.customerType
//                        },
//                        $setOnInsert: {
//                            strike: 0,
//                            sale: 0,
//                            payIn: 0,
//                            payOut: 0,
//                            balance: 0,
//                            payInDetails: [],
//                            payOutDetails: []
//                        }
//                    }
//                    , {upsert: true}, function (err, object) {
//                        if (err) {
//                            return res.send(err);
//                        }
//                    });
//            });
//            callback(null, 'done');
//        }
//    ], function (err, result) {
//        next();
//    });
//};
//
//exports.findEntry = function (input, next) {
//
//
//
//        RecordPage.update({
//            recordDate: input.recordDate,
//            recordType: input.customerType
//        }, {
//            $set: {
//                totalSale: totalPageSale,
//                totalStrike: totalPageStrike
//            }
//        }, function (err) {
//            next(err, managerArray);
//        });
//    });
//};
//
//exports.getRecordInfo = function (input, next) {
//    RecordPage.findOne({
//        recordDate: input.date,
//        recordType: input.recordType
//    }, function (err, object) {
//        if (err) throw err;
//        next(err, object);
//    });
//};
//
//exports.findRecordByID = function (input, next) {
//    RecordPage.findById(input
//        , function (err, object) {
//            if (err) throw err;
//            next(err, object);
//        });
//};
//
//exports.updateEntry = function (input, next) {
//    if (typeof(input.customer_id) === 'object') {
//        async.each(input.customer_id, function (customer_id, callback) {
//            var index = input.customer_id.indexOf(customer_id)
//            Entry.findOneAndUpdate({
//                _recordDetail: input.recordPageID,
//                recordDate: input.date,
//                customer_id: input.customer_id[index],
//                customerType: input.customerType
//            }, {
//                $set: {
//                    strike: input.strike[index],
//                    sale: input.sale[index],
//                }
//            }, function (err, object) {
//                if (err) throw err;
//            });
//        });
//        next(null);
//    } else if (typeof(input.customer_id) === 'string') {
//        Entry.findOneAndUpdate({
//            _recordDetail: input.recordPageID,
//            recordDate: input.date,
//            customer_id: input.customer_id,
//            customerType: input.customerType
//        }, {
//            $set: {
//                strike: input.strike,
//                sale: input.sale
//            }
//        }, function (err, object) {
//            if (err) throw err;
//
//            next(null, object);
//        });
//    } else {
//        next(null);
//    }
//
//};
//
//exports.getSystemBankList = function (input, next) {
//    SystemBank.find({}, function (err, object) {
//        next(err, object);
//    });
//};
//
//exports.getCustomerTypeList = function (query, next) {
//    Customer.find(query).deepPopulate(['_workerDetail', '_workerDetail._profileDetail', '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
//        if (err) throw err;
//        next(err, object);
//    });
//};
//
//exports.getEntryPayIn = function (input, next) {
//    Entry.find({
//        recordDate: input.requestDate,
//        customerType: input.requestRecordType
//    }, function (err, object) {
//        if (err) throw err;
//        next(err, object);
//    })
//};
//
//exports.updatePayIn = function (input, next) {
//    async.waterfall([
//        function (callback) {
//            SystemBank.findOne({_id: input.requestBankID}, function (err, bankObject) {
//                if (bankObject != null) {
//                    Entry.findOneAndUpdate({
//                        recordDate: input.requestDate,
//                        customer_id: input.requestCustomerID,
//                        customerType: input.customerType
//                    }, {
//                        $push: {
//                            "payInDetails": {
//                                payIn: input.payIn,
//                                paymentMethod_id: bankObject.id,
//                                paymentMethodBankName: bankObject.bankName,
//                                paymentMethodBankNumber: bankObject.bankNumber,
//                                paymentMethodBankType: bankObject.bankType
//                            }
//                        }
//                    }, function (err, entryObject) {
//                        callback(null, entryObject.id);
//                    });
//                } else {
//                    callback(null, null);
//                }
//
//            });
//        },
//        function (entryObjectID, callback) {
//            Entry.findOne({
//                _id: entryObjectID
//            }, function (err, entryObject) {
//                callback(null, entryObject);
//            });
//        },
//        function (entryObject, callback) {
//            if (entryObject != null) {
//                var payInArray = underscore.pluck(entryObject.payInDetails, 'payIn');
//                var sum = underscore.reduce(payInArray, function (memo, num) {
//                    return memo + num;
//                }, 0);
//                Entry.findOneAndUpdate({
//                    _id: entryObject.id,
//                }, {
//                    $set: {
//                        "payIn": sum
//                    }
//                }, function (err, recordObject) {
//                    callback(null, 'done');
//                });
//            } else {
//                callback(null, 'done');
//            }
//
//        }
//    ], function (err, result) {
//        next(err, result)
//    });
//};
//
//exports.deletePayIn = function (input, next) {
//    async.waterfall([
//        function (callback) {
//            Entry.findOneAndUpdate({
//                _id: input.entry_id
//            }, {
//                $pull: {
//                    "payInDetails": {
//                        _id: input.delete_id
//                    }
//                }
//            }, function (err, entryObject) {
//                callback(null);
//            });
//        },
//        function (callback) {
//            Entry.findOne({
//                _id: input.entry_id
//            }, function (err, entryObject) {
//                callback(null, entryObject);
//            });
//        },
//        function (entryObject, callback) {
//            var payInArray = underscore.pluck(entryObject.payInDetails, 'payIn');
//            var sum = underscore.reduce(payInArray, function (memo, num) {
//                return memo + num;
//            }, 0);
//            Entry.findOneAndUpdate({
//                _id: entryObject.id,
//            }, {
//                $set: {
//                    "payIn": sum
//                }
//            }, function (err, recordObject) {
//                callback(null, 'done');
//            });
//        }
//    ], function (err, recordObject) {
//        next(err, recordObject)
//    });
//
//};
//
//exports.getEntryPayOut = function (input, next) {
//    Entry.find({
//        recordDate: input.requestDate,
//        customerType: input.requestRecordType
//    }, function (err, object) {
//        if (err) throw err;
//        next(err, object);
//    })
//};
//
//exports.getCustomerBankList = function (input, next) {
//    Bank.find({_customerDetail: input}).populate('_customerDetail').exec(function (err, object) {
//        if (err) throw err;
//        next(err, object);
//    });
//};
//
//exports.updatePayOut = function (input, next) {
//    async.waterfall([
//        function (callback) {
//            Entry.findOneAndUpdate({
//                recordDate: input.requestDate,
//                customer_id: input.requestCustomerID,
//                customerType: input.customerType
//            }, {
//                $push: {
//                    "payOutDetails": {
//                        payOut: input.payOut,
//                        approved: false
//                    }
//                }
//            }, function (err, entryObject) {
//                callback(null, entryObject.id);
//            });
//        },
//        function (entryObjectID, callback) {
//            Entry.findOne({
//                _id: entryObjectID
//            }, function (err, entryObject) {
//                callback(null, entryObject);
//            });
//        },
//        function (entryObject, callback) {
//            if (entryObject != null) {
//                var payOutArray = underscore.pluck(entryObject.payOutDetails, 'payOut');
//                var sum = underscore.reduce(payOutArray, function (memo, num) {
//                    return memo + num;
//                }, 0);
//                Entry.findOneAndUpdate({
//                    _id: entryObject.id,
//                }, {
//                    $set: {
//                        "payOut": sum
//                    }
//                }, function (err, recordObject) {
//                    callback(null, 'done');
//                });
//            } else {
//                callback(null, 'done');
//            }
//        }
//    ], function (err, result) {
//        next(err, result)
//    });
//};
//
//exports.deletePayOut = function (input, next) {
//    async.waterfall([
//        function (callback) {
//            Entry.findOneAndUpdate({
//                _id: input.entry_id
//            }, {
//                $pull: {
//                    "payOutDetails": {
//                        _id: input.delete_id
//                    }
//                }
//            }, function (err, entryObject) {
//                callback(null);
//            });
//        },
//        function (callback) {
//            Entry.findOne({
//                _id: input.entry_id
//            }, function (err, entryObject) {
//                callback(null, entryObject);
//            });
//        },
//        function (entryObject, callback) {
//            var payOutArray = underscore.pluck(entryObject.payOutDetails, 'payOut');
//            var sum = underscore.reduce(payOutArray, function (memo, num) {
//                return memo + num;
//            }, 0);
//            Entry.findOneAndUpdate({
//                _id: entryObject.id,
//            }, {
//                $set: {
//                    "payOut": sum
//                }
//            }, function (err, recordObject) {
//                callback(null, 'done');
//            });
//        }
//    ], function (err, recordObject) {
//        next(err, recordObject)
//    });
//
//};
//
//exports.lockPage = function (input, next) {
//
//    RecordPage.findOneAndUpdate({_id: input.recordPageID}, {
//        $set: {
//            locked: input.locked
//        }
//    }, function (err, object) {
//
//        if (err) throw err;
//        next(null, object);
//    });
//};
//
//exports.getCustomerFinancialHistory = function (input, next) {
//    Entry.find({
//        customer_id: input.requestCustomer_id,
//        customerType: input.requestRecordType
//    }, function (err, object) {
//        if (err) throw err;
//        next(err, underscore.sortBy(object, 'recordDate'));
//    });
//};
