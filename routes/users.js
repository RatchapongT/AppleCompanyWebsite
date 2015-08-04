var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/users');

router.get('/', function (req, res) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/manage', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getUserDetailList(req, function (err, object) {
            if (err) {
                return res.send(err);
            }
            return res.render('users/manage', {
                title: 'User Management',
                data: object,
                currentSessionID: req.session.passport.user.userDetailID,
                successMessage: req.flash('successMessage'),
                failureMessage: req.flash('failureMessage')
            });
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning (manage)',
                warningText: "No Permission"
            }
        );
    }

});

router.post('/create', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.addUser(req.body, function (err) {
            if (err) {
                req.flash('failureMessage', err.errors.username.message);
                return res.redirect('/users/manage');
            }
            req.flash('successMessage', 'Successfully Added');
            return res.redirect('/users/manage');
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning (create)',
                warningText: "No Permission"
            }
        );
    }

});

router.get('/delete/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        if (req.params.id == req.session.passport.user.userDetailID) {
            return res.render('warning',
                {
                    title: 'Warning (delete)',
                    warningText: "Cannot Delete Yourself"
                }
            );
        } else {
            databaseFunction.deleteUser(req.params.id, function (err) {
                if (err) {
                    return res.send(err);
                }
                req.flash('successMessage', 'Successfully Deleted');
                return res.redirect('/users/manage');
            });
        }

    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }
});

router.get('/profiles/:id?', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        var requestUserID = req.params.id ? req.params.id : req.session.passport.user.userDetailID;
        databaseFunction.getUserDetailList(req, function (err, object) {
            if (err) {
                return res.send(err);
            }
            return res.render('users/profiles', {
                title: 'User Management',
                data: object,
                requestUserID: requestUserID,
                successMessage: req.flash('successMessage'),
            });
        });
    } else {
        var requestUserID = req.session.passport.user.userDetailID;
        databaseFunction.findUserDetailById(requestUserID, function (err, object) {
            if (err) {
                return res.send(err);
            }
            return res.render('users/profiles', {
                title: 'User Management',
                data: [object],
                requestUserID: requestUserID,
                successMessage: req.flash('successMessage'),
            });
        });

    }
});

router.post('/profiles/:id?', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        return res.redirect('/users/profiles/' + req.body.select_user_id);
    } else {
        return res.redirect('/users/profiles/' + req.session.passport.user.userDetailID);
    }
});

router.post('/edit', function (req, res) {
    if (req.session.passport.user.accountType != "Admin") {
        req.body.editUserID = req.session.passport.user.userDetailID;
    }
    databaseFunction.editUserProfiles(req.body, function (err, object) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Edited');
        return res.redirect('/users/profiles/' + req.body.requestUserID);
    });

});

router.get('/assign/:id?', function (req, res) {

    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getUnownedCustomerList(req, function (err, unownedCustomerObject) {
            if (err) {
                return res.send(err);
            }
            databaseFunction.getWorkerList(req, function (err, workerObject) {
                if (err) {
                    return res.send(err);
                }
                databaseFunction.getWorkerCustomerRelationship(req, function (err, workerCustomerObject) {
                    if (err) {
                        return res.send(err);
                    }
                    return res.render('users/assign', {
                        title: 'Assign Customer',
                        workerObject: workerObject,
                        workerCustomerObject: workerCustomerObject,
                        unownedCustomerObject: unownedCustomerObject,
                        requestWorkerID: req.params.id,
                        error: req.flash('error')

                    });
                });
            });
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }

});

router.post('/assign', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.assignCustomer(req.body, function (err, customerObject) {
            if (err) {
                return res.send(err);
            }
            return res.redirect('/users/assign/' + req.body.requestWorkerID);
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }
});

router.get('/delete_relationship/:customerID/:requestWorkerID', function (req, res, next) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.deleteWorkerCustomerRelationship(req.params, function (err) {
            if (err) {
                return res.send(err);
            }

            return res.redirect('/users/assign/' + req.params.requestWorkerID);
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }
});


router.get('/payment', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getSystemBankList(req, function (err, systemBankObject) {
            if (err) {
                return res.send(err);
            }
            return res.render('users/payment', {
                title: 'Payment Infomation',
                systemBankObject: systemBankObject,
                error: req.flash('error')
            });
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }

});

router.post('/payment', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {

        databaseFunction.addSystemBank(req.body, function (err) {
            if (err) {
                return res.send(err);
            }
            return res.redirect('/users/payment');
        })
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }
});

router.get('/payment/delete/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.deleteSystemBank(req.params.id, function (err) {
            if (err) {
                return res.send(err);
            }
            return res.redirect('/users/payment');
        });
    }
    else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }
});

module.exports = router;
