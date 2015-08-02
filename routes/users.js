var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/database-function');

router.get('/', function (req, res) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/manage', function (req, res) {
    databaseFunction.getUserDetailList(req, function (err, object) {
        if (err) {
            return res.send(err);
        }
        return res.render('users/manage', {
            title: 'User Management',
            data: object,
            successMessage: req.flash('successMessage'),
            failureMessage: req.flash('failureMessage')
        });
    });
});

router.post('/create', function (req, res) {
    databaseFunction.addUser(req.body, function (err) {
        if (err) {
            req.flash('failureMessage', err.errors.username.message);
            return res.redirect('/users/manage');
        }
        req.flash('successMessage', 'Successfully Added');
        return res.redirect('/users/manage');
    });
});

router.get('/delete/:id', function (req, res) {
    databaseFunction.deleteUser(req.params.id, function (err) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Deleted');
        return res.redirect('/users/manage');
    });
});

router.get('/profiles/:id?', function (req, res) {
    var requestUserID = req.params.id ? req.params.id : req.session.passport.user.id;
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
});

router.post('/profiles/:id?', function (req, res) {
    return res.redirect('/users/profiles/' + req.body.select_user_id);
});

router.post('/edit', function (req, res) {
    databaseFunction.editUserProfiles(req.body, function (err, object) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Edited');
        return res.redirect('/users/profiles/' + req.body.requestUserID);
    });
});

router.get('/assign/:id?', function (req, res) {

    databaseFunction.getUnownedCustomerList(req, function (err, unownedCustomerObject) {
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

});

router.post('/assign', function (req, res) {
    databaseFunction.assignCustomer(req.body, function (err, customerObject) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/users/assign/' + req.body.requestWorkerID);
    });
});

router.get('/delete_relationship/:customerID/:requestWorkerID', function (req, res, next) {
    databaseFunction.deleteWorkerCustomerRelationship(req.params, function (err) {
        if (err) {
            return res.send(err);
        }

        return res.redirect('/users/assign/' + req.params.requestWorkerID);
    });
});


router.get('/payment', function (req, res) {
    databaseFunction.getSystemBankList(req, function (err, systemBankObject) {
        return res.render('users/payment', {
            title: 'Payment Infomation',
            systemBankObject: systemBankObject,
            error: req.flash('error')
        });
    });

});

router.post('/payment', function (req, res) {
    databaseFunction.addSystemBank(req.body, function (err) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/users/payment');
    })
});

router.get('/payment/delete/:id', function (req, res) {
    databaseFunction.deleteSystemBank(req.params.id, function (err) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/users/payment');
    });

});

module.exports = router;
