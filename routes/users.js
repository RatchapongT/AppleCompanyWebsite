var express = require('express');
var router = express.Router();
var databaseService = require('../services/database-service');

var User = require('../models/database').User;
var Relationship = require('../models/database').Relationship;
var Customer = require('../models/database').Customer;
var Bank = require('../models/database').Bank;

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});


router.post('/create', function (req, res, next) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.addUser(req.body, function (err) {
            if (err) {
                console.log(err);
                req.flash('error', "Username Already Exists");
                return res.redirect('/users/manage');
            }
            req.flash('error', "Successfully Added");
            return res.redirect('/users/manage');
        });

    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});


router.get('/assign', function (req, res, next) {
    if (req.session.passport.user.accountType == "Admin") {

        databaseService.getRelationshipList(req, function (err, relationshipObject) {
            if (err) {
                return res.send(err);
            }
            databaseService.getWorkerList(req, function (err, userObject) {
                if (err) {
                    return res.send(err);
                }

                databaseService.getUnownedCustomerList(req, function (err, customerObject) {
                    if (err) {
                        return res.send(err);
                    }

                    return res.render('users/assign', {
                        title: 'Assign Customer',
                        dataUser: userObject,
                        dataCustomer: customerObject,
                        dataRelationship: relationshipObject,
                        searchUser: req.session.passport.user,
                        error: req.flash('error')
                    });
                });
            });
        });
    }

});

router.get('/delete_relationship/:id/:customerID/:username', function (req, res, next) {
    if (req.session.passport.user.accountType == "Admin") {

        databaseService.deleteRelationship(req, function (err) {
            if (err) {
                return res.send(err);
            }
            User.update({username: req.params.username}, {$pull: {"responsibleCustomer": req.params.customerID}}, function (err) {
                if (err) {
                    return res.send(err);
                }
                Customer.update({customerID: req.params.customerID}, {
                    $set: {
                        responsibleWorker: "",
                        haveOwner: false
                    }
                }, function (err) {
                    if (err) {
                        return res.send(err);
                    }
                    req.flash('error', "Successfully Delete Relationship");
                    return res.redirect('/users/assign');
                });
            });
        });


    }

});


router.get('/assign/:username', function (req, res, next) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getRelationshipList(req, function (err, relationshipObject) {
            if (err) {
                return res.send(err);
            }
            databaseService.getWorkerList(req, function (err, userObject) {
                if (err) {
                    return res.send(err);
                }
                databaseService.getUnownedCustomerList(req, function (err, customerObject) {
                    if (err) {
                        return res.send(err);
                    }
                    return res.render('users/assign', {
                        title: 'Assign Customer',
                        dataUser: userObject,
                        dataCustomer: customerObject,
                        searchUser: req.params.username,
                        dataRelationship: relationshipObject,
                        error: req.flash('error')
                    });
                });
            });
        });
    }
});

router.post('/assign', function (req, res, next) {
    if (req.session.passport.user.accountType == "Admin") {

        Relationship.findOne({customerID: req.body.customerID}, function (err, object) {

            if (err) {
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong lol',
                    error: err
                });
            }

            if (object) {
                req.flash('error', object.customerID + " already been assigned");
                return res.redirect('/users/assign/' + req.body.username);
            } else {
                databaseService.addRelationship(req.body, function (err) {
                    if (err) {
                        return res.send(err);
                    }

                    Customer.update({customerID: req.body.customerID},
                        {
                            $set: {
                                responsibleWorker: req.body.username,
                                haveOwner: true
                            }
                        }, function (err) {
                            if (err) {
                                return res.send(err);
                            }

                            User.update(
                                {username: req.body.username},
                                {
                                    $push: {
                                        "responsibleCustomer": req.body.customerID
                                    }
                                },
                                function (err, result) {
                                    if (err) {
                                        return res.send(err);
                                    }
                                    req.flash('error', "Successfully Assign");
                                    return res.redirect('/users/assign/' + req.body.username);
                                });
                        });
                });
            }
        });
    }
});

router.get('/manage', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getUserList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            return res.render('users/manage', {
                title: 'User Management',
                data: object,
                error: req.flash('error')
            });
        });
    }

    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});

router.get('/profiles', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getUserList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            User.findOne({username: req.session.passport.user.username}, 'username created accountType nickname phone lineID', function (err, searchUser) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('users/profiles', {
                    title: 'User Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchUser: searchUser
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});


router.post('/profiles', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getUserList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            User.findOne({username: req.body.username}, 'username created accountType nickname phone lineID', function (err, searchUser) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('users/profiles', {
                    title: 'User Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchUser: searchUser
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});


router.get('/profiles/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getUserList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            User.findOne({_id: req.params.id}, 'username created accountType nickname phone lineID', function (err, searchUser) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('users/profiles', {
                    title: 'User Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchUser: searchUser
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});


router.post('/edit', function (req, res) {

    if (req.session.passport.user.accountType == "Admin") {
        User.findByIdAndUpdate(req.body.id, {
            $set: {
                lineID: req.body.lineID,
                phone: req.body.phone,
                nickname: req.body.nickname
            }
        }, function (err, object) {
            if (err) return handleError(err);
            req.flash('error', "Successfully edit " + object.username);
            return res.redirect('/users/profiles/' + object.id);
        });
    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});


router.get('/delete/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.deleteUser(req, function (err) {
            if (err) {
                console.log(err);
                var vm = {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                };
                return res.render('error', vm);
            }
            return res.redirect('/users/manage');
        });
    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});


router.get('/payment', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getBankList(req, function (err, object) {
            return res.render('users/payment', {
                title: 'Payment Infomation',
                data: object,
                error: req.flash('error')
            });
        });

    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});

router.post('/payment', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {

        databaseService.addBank(req.body, function (err) {
            if (err) {
                return res.send(err);
            }
            return res.redirect('/users/payment');
        })
    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});

router.get('/payment/delete/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        console.log(req.params);
        databaseService.deleteBank(req, function (err) {
            if (err) {
                return res.send(err);
            }
            return res.redirect('/users/payment');
        })
    }
    if (req.session.passport.user.accountType == "Worker") {
        res.send("No permission");
    }
});
module.exports = router;
