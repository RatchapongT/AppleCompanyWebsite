var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/database-function');

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/manage', function (req, res) {
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
});

router.post('/create', function (req, res) {
    databaseFunction.addCustomer(req.body, function (err) {
        if (err) {
            req.flash('failureMessage', err.errors.customerID.message);
            return res.redirect('/customers/manage');
        }
        req.flash('successMessage', "Successfully Added");
        return res.redirect('/customers/manage');
    });
});

router.get('/delete/:id', function (req, res) {
    databaseFunction.deleteCustomer(req.params.id, function (err) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Deleted');
        return res.redirect('/customers/manage');
    });
});

router.get('/bank/:id?', function (req, res) {

    databaseFunction.getBankList(req, function (err, bankObject) {
        if (err) {
            return res.send(err);
        }
        databaseFunction.getCustomerList(req, function (err, customerObject) {
            if (err) {
                return res.send(err);
            }
            return res.render('customers/bank', {
                title: 'Bank Management',
                bankObject: bankObject,
                customerObject: customerObject,
                successMessage: req.flash('successMessage'),
                failureMessage: req.flash('failureMessage'),
                requestCustomerID: req.params.id
            });
        });

    });

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

    databaseFunction.getBankList(req, function (err, bankObject) {
        if (err) {
            return res.send(err);
        }
        databaseFunction.getCustomerList(req, function (err, customerObject) {
            if (err) {
                return res.send(err);
            }

            return res.render('customers/profiles', {
                title: 'Customer Profile',
                customerObject: customerObject,
                bankObject: bankObject,
                currentUser: req.session.passport.user.username,
                error: req.flash('error'),
                successMessage: req.flash('successMessage'),
                failureMessage: req.flash('failureMessage'),
                requestCustomerID: req.params.id
            });
        });
    });
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