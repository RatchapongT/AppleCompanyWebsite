var express = require('express');
var router = express.Router();
var databaseService = require('../services/database-service');
var Customer = require('../models/database').Customer;
var User = require('../models/database').User;
var Bank = require('../models/database').Bank;

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});


router.get('/manage', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getCustomerList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            return res.render('customers/manage', {
                title: 'Customer Management',
                data: object,
                error: req.flash('error')
            });
        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});


router.post('/create', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.addCustomer(req.body, function (err) {
            if (err) {
                console.log(err);
                req.flash('error', "Customer ID Already Exists");
                return res.redirect('/customers/manage');
            }
            req.flash('error', "Successfully Added");
            return res.redirect('/customers/manage');
        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});

router.get('/delete/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.deleteCustomer(req, function (err) {
            if (err) {
                console.log(err);
                var vm = {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                };
                return res.render('error', vm);
            }
            return res.redirect('/customers/manage');
        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }

});


router.get('/profiles', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getCustomerList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            Customer.findOne({}, 'bank customerID created percent nickname phone lineID malay thai paymentCondition', function (err, searchCustomer) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('customers/profiles', {
                    title: 'Customer Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchCustomer: searchCustomer
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});

router.get('/profiles/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getCustomerList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            Customer.findOne({_id: req.params.id}, 'bank customerID created percent nickname phone lineID malay thai paymentCondition', function (err, searchCustomer) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('customers/profiles', {
                    title: 'Customer Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchCustomer: searchCustomer
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});


router.post('/profiles', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getCustomerList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            Customer.findOne({customerID: req.body.customerID}, 'bank customerID created percent nickname phone lineID malay thai paymentCondition', function (err, searchCustomer) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('customers/profiles', {
                    title: 'Customer Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchCustomer: searchCustomer
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});

router.post('/edit', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {

        Customer.findByIdAndUpdate(req.body.id, {
            $set: {
                malay: req.body.malay,
                thai: req.body.thai,
                nickname: req.body.nickname,
                phone: req.body.phone,
                lineID: req.body.lineID,
                percent: req.body.percent,
                paymentCondition: req.body.paymentCondition
            }
        }, function (err, object) {
            if (err) return handleError(err);
            req.flash('error', "Successfully edit " + object.customerID);
            return res.redirect('/customers/profiles/' + object.id);
        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});


router.get('/bank', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getCustomerList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            Customer.findOne({}, 'customerID bank', function (err, searchCustomer) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('customers/bank', {
                    title: 'Customer Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchCustomer: searchCustomer
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});


router.get('/bank/:id', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getCustomerList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            Customer.findOne({_id: req.params.id}, 'customerID bank', function (err, searchCustomer) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('customers/bank', {
                    title: 'Customer Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchCustomer: searchCustomer
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});

router.post('/bank', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseService.getCustomerList(req, function (err, object) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            Customer.findOne({_id: req.body.id}, 'customerID bank', function (err, searchCustomer) {
                if (err) {
                    console.log(err);
                    return res.render('error', {
                        title: 'Error Page',
                        message: 'Something went wrong',
                        error: err
                    });
                }
                return res.render('customers/bank', {
                    title: 'Customer Management',
                    data: object,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    searchCustomer: searchCustomer
                });
            });

        });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});


router.post('/addbank', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {

        Customer.update(
            {_id: req.body.id},
            {
                $push: {
                    "bank": {
                        bankName: req.body.bankName,
                        bankNumber: req.body.bankNumber,
                        bankType: req.body.bankType
                    }
                }
            },
            function (err, model) {
                if (err) return next(err);
                req.flash('error', "Successfully Added Bank" + req.body.customerID);
                return res.redirect('/customers/bank/' + req.body.id);
            });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }

});

router.get('/bank/delete/:customerID/:bankId', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        Customer.update(
            {_id: req.params.customerID},
            {
                $pull: {
                    "bank": {
                        "_id": req.params.bankId
                    }
                }
            },
            function (err, result) {
                if (err) return next(err);
                req.flash('error', "Bank Deleted!");
                return res.redirect('/customers/bank/' + req.params.customerID);
            });
    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }

});

router.post('/bank/edit/:customerID/:bankID', function (req, res) {

    if (req.session.passport.user.accountType == "Admin") {

        Customer.findOneAndUpdate({
                _id: req.params.customerID,
                'bank._id': req.params.bankID
            },
            {
                $set: {
                    'bank.$.bankType': req.body.bankType,
                    'bank.$.bankName': req.body.bankName,
                    'bank.$.bankNumber': req.body.bankNumber
                }
            }, function (err, book) {
                if (err) return handleError(err);
                req.flash('error', "Edited bank of " + book.customerID);
                return res.redirect('/customers/profiles/' + book.id);
            });


    }
    if (req.session.passport.user.accountType == "Worker" ||
        req.session.passport.user.accountType == "Manager") {
        return res.send("No permission");
    }
});

module.exports = router;