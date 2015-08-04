var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/customers');

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/manage', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getCustomerList(req, function (err, customerObject) {
            if (err) {
                return res.send(err);
            }
            return res.render('customers/manage', {
                title: 'Customer Management',
                customerObject: customerObject,
                successMessage: req.flash('successMessage'),
                failureMessage: req.flash('failureMessage')
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

router.post('/create', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.addCustomer(req.body, function (err) {
            if (err) {
                req.flash('failureMessage', err.errors.customerID.message);
                return res.redirect('/customers/manage');
            }
            req.flash('successMessage', "Successfully Added");
            return res.redirect('/customers/manage');
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

router.get('/delete/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.deleteCustomer(req.params.id, function (err) {
            if (err) {
                return res.send(err);
            }
            req.flash('successMessage', 'Successfully Deleted');
            return res.redirect('/customers/manage');
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

router.get('/bank/:id?', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getCustomerList(req, function (err, customerObject) {
            var requestCustomerID = req.params.id ? req.params.id : (customerObject[0] ? customerObject[0].id : null);
            if (err) {
                return res.send(err);
            }
            databaseFunction.getBankList(requestCustomerID, function (err, bankObject) {
                if (err) {
                    return res.send(err);
                }
                return res.render('customers/bank', {
                    title: 'Bank Management',
                    bankObject: bankObject,
                    customerObject: customerObject,
                    successMessage: req.flash('successMessage'),
                    failureMessage: req.flash('failureMessage'),
                    requestCustomerID: requestCustomerID
                });
            });

        });
    }
    else if (req.session.passport.user.accountType == "Worker") {
        databaseFunction.getCustomerListLimited(req.session.passport.user.workerID, function (err, customerObject) {
            var requestCustomerID = req.params.id ? req.params.id : (customerObject[0] ? customerObject[0].id : null);
            if (err) {
                return res.send(err);
            }
            databaseFunction.getBankList(requestCustomerID, function (err, bankObject) {
                if (err) {
                    return res.send(err);
                }
                return res.render('customers/bank', {
                    title: 'Bank Management',
                    bankObject: bankObject,
                    customerObject: customerObject,
                    successMessage: req.flash('successMessage'),
                    failureMessage: req.flash('failureMessage'),
                    requestCustomerID: requestCustomerID
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

router.post('/bank', function (req, res) {
    return res.redirect('/customers/bank/' + req.body.request_customer_id);
});

router.post('/bank/add', function (req, res) {
    databaseFunction.addBank(req.body, function (err) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Added');
        return res.redirect('/customers/bank/' + req.body.customerID);
    });
});

router.get('/bank/delete/:bankID/:customerID', function (req, res) {

    databaseFunction.deleteBank(req.params.bankID, function (err) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Deleted');
        return res.redirect('/customers/bank/' + req.params.customerID);
    });
});

router.get('/profiles/:id?', function (req, res) {

    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getCustomerList(req, function (err, customerObject) {
            if (err) {
                return res.send(err);
            }
            var requestCustomerID = req.params.id ? req.params.id : (customerObject[0] ? customerObject[0].id : null);
            databaseFunction.getBankList(requestCustomerID, function (err, bankObject) {
                if (err) {
                    return res.send(err);
                }

                return res.render('customers/profiles', {
                    title: 'Customer Profile',
                    customerObject: customerObject,
                    customerBankObject: bankObject,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    successMessage: req.flash('successMessage'),
                    failureMessage: req.flash('failureMessage'),
                    requestCustomerID: requestCustomerID
                });
            });
        });
    } else if (req.session.passport.user.accountType == "Worker") {
        databaseFunction.getCustomerListLimited(req.session.passport.user.workerID, function (err, customerObject) {
            if (err) {
                return res.send(err);
            }
            var requestCustomerID = req.params.id ? req.params.id : (customerObject[0] ? customerObject[0].id : null);
            databaseFunction.getBankList(requestCustomerID, function (err, bankObject) {
                if (err) {
                    return res.send(err);
                }

                return res.render('customers/profiles', {
                    title: 'Customer Profile',
                    customerObject: customerObject,
                    customerBankObject: bankObject,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    successMessage: req.flash('successMessage'),
                    failureMessage: req.flash('failureMessage'),
                    requestCustomerID: requestCustomerID
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

router.post('/profiles', function (req, res) {
    return res.redirect('/customers/profiles/' + req.body.request_customer_id);
});

router.post('/edit', function (req, res) {
    databaseFunction.editCustomerProfiles(req.body, function (err, object) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Edited');
        return res.redirect('/customers/profiles/' + req.body.editCustomerID);
    });
});

module.exports = router;