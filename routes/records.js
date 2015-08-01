//var express = require('express');
//var router = express.Router();
//var databaseService = require('../services/database-service');
//
//var User = require('../models/database').User;
//var Relationship = require('../models/database').Relationship;
//var Customer = require('../models/database').Customer;
//var Bank = require('../models/database').Bank;
//var Entry = require('../models/database').Entry;
//var Record = require('../models/database').Record;
//var async = require('async');
//
//router.get('/', function (req, res, next) {
//    res.render('homepage', {
//        title: 'Homepage',
//        currentUser: req.session.passport.user.username
//    });
//});
//router.get('/initialize', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin" ||
//        req.session.passport.user.accountType == "Manager") {
//        var date = new Date();
//        var requestDate = null;
//        if (date.getMonth() + 1 < 10) {
//            requestDate = new Date(date.getFullYear() + '-0' + (date.getMonth() + 1) + '-' + date.getDate());
//        } else {
//            requestDate = new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
//        }
//
//        var i = 0;
//        Relationship.find({manager : { $ne: null }}, function (err, manageRelationshipObject) {
//            async.each(manageRelationshipObject, function (relationshipData, callback) {
//                Relationship.find({username : relationshipData.username, customerID : { $ne: null }}, function (err, customRelationshipObject) {
//                    async.each(customRelationshipObject, function (data, callback) {
//                        var managerObject = relationshipData.manager;
//                        var workerObject = data.username;
//                        var customerObject = data.customerID;
//                        i++;
//                        Entry.findOneAndUpdate({
//                            recordDate: requestDate,
//                            customerID: customerObject,
//                            workerID: workerObject,
//                            managerID: managerObject
//                        }, {
//                            recordDate: requestDate,
//                            customerID: customerObject,
//                            workerID: workerObject,
//                            managerID: managerObject
//                        }, {upsert: true}, function (err, object) {
//                            if (err) {
//                                return res.send(err);
//                            }
//
//                        });
//
//
//                    });
//
//                });
//            });
//        });
//
//    }
//});
//
//router.get('/initialize/:date', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin" ||
//        req.session.passport.user.accountType == "Manager") {
//        requestDate = req.params.date;
//    }
//
//});
//router.get('/manage', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin") {
//        var date = new Date();
//        var requestDate = null;
//        if (date.getMonth() + 1 < 10) {
//            requestDate = new Date(date.getFullYear() + '-0' + (date.getMonth() + 1) + '-' + date.getDate());
//        } else {
//            requestDate = new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
//        }
//
//        Entry.find({recordDate: requestDate}, function (err, entryObject) {
//            if (err) {
//                return res.send(err);
//            }
//            Record.findOne({recordDate: requestDate}, function (err, object) {
//                if (err) {
//                    return res.send(err);
//                }
//                databaseService.getWorkerList(req, function (err, workerObject) {
//                    if (err) {
//                        return res.send(err);
//                    }
//
//                    if (object) {
//                        return res.render('records/manage', {
//                                title: 'Record Management',
//                                data: object,
//                                requestDate: requestDate,
//                                workerObject: workerObject,
//                                entryObject: entryObject
//                            }
//                        )
//                    } else {
//                        var newRecord = new Record({
//                            recordDate: requestDate
//                        });
//
//                        newRecord.save(function (err) {
//                            if (err) {
//                                return res.send(err);
//                            }
//                            return res.redirect('/records/manage');
//                        });
//                    }
//                });
//            });
//        });
//    }
//});
//
//router.get('/manage/:date', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin") {
//
//        Entry.find({recordDate: req.params.date}, function (err, entryObject) {
//            if (err) {
//                return res.send(err);
//            }
//            Record.findOne({recordDate: req.params.date}, function (err, object) {
//                if (err) {
//                    return res.send(err);
//                }
//                databaseService.getWorkerList(req, function (err, workerObject) {
//                    if (err) {
//                        return res.send(err);
//                    }
//
//                    if (object) {
//                        return res.render('records/manage', {
//                                title: 'Record Management',
//                                data: object,
//                                requestDate: req.params.date,
//                                workerObject: workerObject,
//                                entryObject: entryObject
//                            }
//                        )
//                    } else {
//                        var newRecord = new Record({
//                            recordDate: req.params.date
//                        });
//
//                        newRecord.save(function (err) {
//                            if (err) {
//                                return res.send(err);
//                            }
//                            return res.redirect('/records/manage/' + req.params.date);
//                        });
//                    }
//                });
//            });
//        });
//
//
//    }
//});
//
//router.post('/manage/:date', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin") {
//
//        Entry.find({recordDate: req.params.date}, function (err, entryObject) {
//            if (err) {
//                return res.send(err);
//            }
//            Record.findOne({recordDate: req.params.date}, function (err, object) {
//                if (err) {
//                    return res.send(err);
//                }
//                databaseService.getWorkerList(req, function (err, workerObject) {
//                    if (err) {
//                        return res.send(err);
//                    }
//
//                    if (object) {
//                        return res.render('records/manage', {
//                                title: 'Record Management',
//                                data: object,
//                                requestDate: req.params.date,
//                                workerObject: workerObject,
//                                entryObject: entryObject
//                            }
//                        )
//                    } else {
//                        var newRecord = new Record({
//                            recordDate: req.params.date
//                        });
//
//                        newRecord.save(function (err) {
//                            if (err) {
//                                return res.send(err);
//                            }
//                            return res.redirect('/records/manage/' + req.params.date);
//                        });
//                    }
//                });
//            });
//        });
//
//
//    }
//});
//
//router.post('/update', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin") {
//        var customerLoop = req.body.customerID;
//        var saleLoop = req.body.sale;
//        var strikeLoop = req.body.strike;
//
//        Record.findOne({recordDate: req.body.date}, function (err, object) {
//            if (err) {
//                return res.send(err);
//            }
//            if (object.locked) {
//                return res.send("Document is locked");
//            } else {
//                async.each(customerLoop, function (data, callback) {
//                    var index = customerLoop.indexOf(data);
//                    Entry.findOneAndUpdate({
//                        recordDate: req.body.date,
//                        customerID: customerLoop[index]
//                    }, {
//                        recordDate: req.body.date,
//                        customerID: customerLoop[index],
//                        sale: saleLoop[index],
//                        strike: strikeLoop[index],
//                    }, {upsert: true}, function (err, object) {
//                        if (err) {
//                            return res.send(err);
//                        }
//                    });
//
//                }, function (error) {
//                    if (error) {
//                        return res.send(err);
//                    }
//                });
//            }
//
//        });
//        return res.redirect('/records/manage/' + req.body.date);
//    }
//
//
//});
//
//router.post('/lock', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin") {
//
//        Record.findOneAndUpdate({recordDate: req.body.date}, {
//            $set: {
//                locked: req.body.locked
//            }
//        }, function (err, object) {
//            if (err) {
//                return res.send(err);
//            }
//            return res.redirect('/records/manage/' + req.body.date);
//        });
//    }
//});
//
//module.exports = router;
//
//
