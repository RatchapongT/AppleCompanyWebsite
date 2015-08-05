var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/partners');

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/manage', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getPartnerList(req, function (err, partnerObject) {
            if (err) {
                return res.send(err);
            }
            return res.render('partners/manage', {
                title: 'Partner Management',
                partnerObject: partnerObject,
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
        databaseFunction.addPartner(req.body, function (err) {
            if (err) {
                req.flash('failureMessage', err.errors.partnerID.message);
                return res.redirect('/partners/manage');
            }
            req.flash('successMessage', "Successfully Added");
            return res.redirect('/partners/manage');
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
        databaseFunction.deletePartner(req.params.id, function (err) {
            if (err) {
                return res.send(err);
            }
            req.flash('successMessage', 'Successfully Deleted');
            return res.redirect('/partners/manage');
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
        databaseFunction.getPartnerList(req, function (err, partnerObject) {
            var requestPartnerID = req.params.id ? req.params.id : (partnerObject[0] ? partnerObject[0].id : null);
            if (err) {
                return res.send(err);
            }
            databaseFunction.getBankList(requestPartnerID, function (err, bankObject) {
                if (err) {
                    return res.send(err);
                }
                return res.render('partners/bank', {
                    title: 'Bank Management',
                    bankObject: bankObject,
                    partnerObject: partnerObject,
                    successMessage: req.flash('successMessage'),
                    failureMessage: req.flash('failureMessage'),
                    requestPartnerID: requestPartnerID
                });
            });

        });
    }
    else if (req.session.passport.user.accountType == "Worker") {
        databaseFunction.getPartnerListLimited(req.session.passport.user.workerID, function (err, partnerObject) {
            var requestPartnerID = req.params.id ? req.params.id : (partnerObject[0] ? partnerObject[0].id : null);
            if (err) {
                return res.send(err);
            }
            databaseFunction.getBankList(requestPartnerID, function (err, bankObject) {
                if (err) {
                    return res.send(err);
                }
                return res.render('partners/bank', {
                    title: 'Bank Management',
                    bankObject: bankObject,
                    partnerObject: partnerObject,
                    successMessage: req.flash('successMessage'),
                    failureMessage: req.flash('failureMessage'),
                    requestPartnerID: requestPartnerID
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
    return res.redirect('/partners/bank/' + req.body.request_partner_id);
});

router.post('/bank/add', function (req, res) {
    databaseFunction.addBank(req.body, function (err) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Added');
        return res.redirect('/partners/bank/' + req.body.partnerID);
    });
});

router.get('/bank/delete/:bankID/:partnerID', function (req, res) {

    databaseFunction.deleteBank(req.params.bankID, function (err) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Deleted');
        return res.redirect('/partners/bank/' + req.params.partnerID);
    });
});

router.get('/profiles/:id?', function (req, res) {

    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getPartnerList(req, function (err, partnerObject) {
            if (err) {
                return res.send(err);
            }
            var requestPartnerID = req.params.id ? req.params.id : (partnerObject[0] ? partnerObject[0].id : null);
            databaseFunction.getBankList(requestPartnerID, function (err, bankObject) {
                if (err) {
                    return res.send(err);
                }

                return res.render('partners/profiles', {
                    title: 'Partner Profile',
                    partnerObject: partnerObject,
                    partnerBankObject: bankObject,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    successMessage: req.flash('successMessage'),
                    failureMessage: req.flash('failureMessage'),
                    requestPartnerID: requestPartnerID
                });
            });
        });
    } else if (req.session.passport.user.accountType == "Worker") {
        databaseFunction.getPartnerListLimited(req.session.passport.user.workerID, function (err, partnerObject) {
            if (err) {
                return res.send(err);
            }
            var requestPartnerID = req.params.id ? req.params.id : (partnerObject[0] ? partnerObject[0].id : null);
            databaseFunction.getBankList(requestPartnerID, function (err, bankObject) {
                if (err) {
                    return res.send(err);
                }

                return res.render('partners/profiles', {
                    title: 'Partner Profile',
                    partnerObject: partnerObject,
                    partnerBankObject: bankObject,
                    currentUser: req.session.passport.user.username,
                    error: req.flash('error'),
                    successMessage: req.flash('successMessage'),
                    failureMessage: req.flash('failureMessage'),
                    requestPartnerID: requestPartnerID
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
    return res.redirect('/partners/profiles/' + req.body.request_partner_id);
});

router.post('/edit', function (req, res) {
    databaseFunction.editPartnerProfiles(req.body, function (err, object) {
        if (err) {
            return res.send(err);
        }
        req.flash('successMessage', 'Successfully Edited');
        return res.redirect('/partners/profiles/' + req.body.editPartnerID);
    });
});

module.exports = router;