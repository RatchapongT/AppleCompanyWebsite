//var express = require('express');
//var router = express.Router();
//var databaseService = require('../services/database-service');
//var Customer = require('../models/database').Customer;
//var User = require('../models/database').User;
//var Bank = require('../models/database').Bank;
//var Relationship = require('../models/database').Relationship;
//
///* GET users listing. */
//router.get('/', function (req, res, next) {
//    res.render('homepage', {
//        title: 'Homepage',
//        currentUser: req.session.passport.user.username
//    });
//});
//
//router.get('/assign', function (req, res) {
//    if (req.session.passport.user.accountType == "Admin") {
//        databaseService.getRelationshipListWorker(req, function (err, relationshipObject) {
//            if (err) {
//                return res.send(err);
//            }
//            databaseService.getUnownedWorkerList(req, function (err, workerObject) {
//                if (err) {
//                    return res.send(err);
//                }
//                databaseService.getManagerList(req, function (err, managerObject) {
//                    if (err) {
//                        return res.send(err);
//                    }
//
//                    return res.render('managers/manage', {
//                        title: 'Assign Manager',
//                        dataWorker: workerObject,
//                        dataManager: managerObject,
//                        dataRelationship: relationshipObject,
//                        searchUser: req.session.passport.user,
//                        error: req.flash('error')
//                    });
//                });
//            });
//        });
//    }
//
//    if (req.session.passport.user.accountType == "Worker" ||
//        req.session.passport.user.accountType == "Manager" ) {
//        return res.send("No permission");
//    }
//});
//
//router.post('/assign', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin") {
//
//        Relationship.findOne({username: req.body.worker_username, manager : { $ne: null }}, function (err, object) {
//
//            if (err) {
//                return res.send(err);
//            }
//
//            if (object) {
//                req.flash('error', object.username + " already been assigned");
//                return res.redirect('/managers/assign/' + req.body.worker_username);
//            } else {
//                databaseService.addRelationshipWorker(req.body, function (err) {
//                    if (err) {
//                        return res.send(err);
//                    }
//
//                    User.update({username: req.body.worker_username},
//                        {
//                            $set: {
//                                manager: req.body.manager_username,
//                                haveManager: true
//                            }
//                        }, function (err) {
//                            if (err) {
//                                return res.send(err);
//                            }
//
//                            User.update(
//                                {username: req.body.manager_username},
//                                {
//                                    $push: {
//                                        "responsibleWorker": req.body.worker_username
//                                    }
//                                },
//                                function (err, result) {
//                                    if (err) {
//                                        return res.send(err);
//                                    }
//                                    req.flash('error', "Successfully Assign");
//                                    return res.redirect('/managers/assign/' + req.body.manager_username);
//                                });
//                        });
//                });
//            }
//        });
//    }
//    if (req.session.passport.user.accountType == "Worker" ||
//        req.session.passport.user.accountType == "Manager" ) {
//        return res.send("No permission");
//    }
//});
//
//router.get('/assign/:username', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin") {
//        databaseService.getRelationshipListWorker(req, function (err, relationshipObject) {
//            if (err) {
//                return res.send(err);
//            }
//            databaseService.getUnownedWorkerList(req, function (err, workerObject) {
//                if (err) {
//                    return res.send(err);
//                }
//                databaseService.getManagerList(req, function (err, managerObject) {
//                    if (err) {
//                        return res.send(err);
//                    }
//
//                    return res.render('managers/manage', {
//                        title: 'Assign Manager',
//                        dataWorker: workerObject,
//                        dataManager: managerObject,
//                        dataRelationship: relationshipObject,
//                        searchUser: req.params.username,
//                        error: req.flash('error')
//                    });
//                });
//            });
//        });
//    }
//
//    if (req.session.passport.user.accountType == "Worker" ||
//        req.session.passport.user.accountType == "Manager" ) {
//        return res.send("No permission");
//    }
//});
//
//router.get('/delete_relationship/:id/:worker_username/:manager_username', function (req, res, next) {
//    if (req.session.passport.user.accountType == "Admin") {
//
//        databaseService.deleteRelationship(req, function (err) {
//            if (err) {
//                return res.send(err);
//            }
//            User.update({username: req.params.manager_username}, {$pull: {"responsibleWorker": req.params.worker_username}}, function (err) {
//                if (err) {
//                    return res.send(err);
//                }
//                User.update({username: req.params.worker_username}, {
//                    $set: {
//                        manager: "",
//                        haveManager: false
//                    }
//                }, function (err) {
//                    if (err) {
//                        return res.send(err);
//                    }
//                    req.flash('error', "Successfully Delete Relationship");
//                    return res.redirect('/managers/assign');
//                });
//            });
//        });
//    }
//    if (req.session.passport.user.accountType == "Worker" ||
//        req.session.passport.user.accountType == "Manager" ) {
//        return res.send("No permission");
//    }
//
//});
//
//module.exports = router;
//
