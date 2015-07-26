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
        currentUser: req.session.passport.user
    });
});


module.exports = router;


router.get('/manage', function (req, res) {
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
});



router.post('/create', function (req, res) {
    databaseService.addCustomer(req.body, function (err) {
        console.log(req.body);
        if (err) {
            console.log(err);
            req.flash('error', "Customer ID Already Exists");
            return res.redirect('/customers/manage');
        }
        req.flash('error', "Successfully Added");
        return res.redirect('/customers/manage');
    });
});

router.get('/delete/:id', function (req, res) {
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

});


router.get('/profiles', function (req, res) {
    databaseService.getCustomerList(req, function (err, object) {
        if (err) {
            console.log(err);
            return res.render('error', {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            });
        }
        Customer.findOne({}, 'customerID created percent nickname phone lineID malay thai paymentCondition', function (err, searchCustomer) {
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
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchCustomer: searchCustomer
            });
        });

    });
});

router.get('/profiles/:id', function (req, res) {
    databaseService.getCustomerList(req, function (err, object) {
        if (err) {
            console.log(err);
            return res.render('error', {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            });
        }
        Customer.findOne({_id : req.params.id}, 'customerID created percent nickname phone lineID malay thai paymentCondition', function (err, searchCustomer) {
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
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchCustomer: searchCustomer
            });
        });

    });
});


router.post('/profiles', function (req, res) {
    console.log(req.body);
    databaseService.getCustomerList(req, function (err, object) {
        if (err) {
            console.log(err);
            return res.render('error', {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            });
        }
        Customer.findOne({customerID: req.body.customerID}, 'customerID created percent nickname phone lineID malay thai paymentCondition', function (err, searchCustomer) {
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
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchCustomer: searchCustomer
            });
        });

    });
});

router.post('/edit', function (req, res) {

    console.log(req.body.paymentCondition);
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
});


router.get('/bank', function (req, res) {
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
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchCustomer: searchCustomer
            });
        });

    });
});


router.get('/bank/:id', function (req, res) {
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
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchCustomer: searchCustomer
            });
        });

    });
});

router.post('/bank', function (req, res) {
    databaseService.getCustomerList(req, function (err, object) {
        if (err) {
            console.log(err);
            return res.render('error', {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            });
        }
        Customer.findOne({customerID: req.body.customerID}, 'customerID bank', function (err, searchCustomer) {
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
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchCustomer: searchCustomer
            });
        });

    });
});


router.post('/addbank', function (req, res) {
    Customer.update(
        req.id,
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
            req.flash('error', "Successfully Added Bank");
            return res.redirect('/customers/bank/' + req.body.id);
        });

});

router.get('/bank/delete/:customerID/:bankId', function (req, res) {
    Customer.update(
        req.params.customerID,
        {
            $pull: {
                "bank": {
                    "_id" : req.params.bankId
                }
            }
        },
        function (err, model) {
            if (err) return next(err);
            req.flash('error', "Bank Deleted!");
            return res.redirect('/customers/bank/' + req.params.customerID);
        });

});

module.exports = router;