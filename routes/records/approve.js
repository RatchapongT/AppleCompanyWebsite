var express = require('express');
var router = express.Router();
var databaseFunction = require('../../services/records');
var underscore = require('underscore');

function ParseToday() {
    var today = new Date();
    if (today.getMonth() + 1 < 10) {
        if (today.getDate() < 10) {
            return new Date(today.getFullYear() + '-0' + (today.getMonth() + 1) + '-0' + today.getDate());
        } else {
            return new Date(today.getFullYear() + '-0' + (today.getMonth() + 1) + '-' + today.getDate());
        }

    } else {
        if (today.getDate() < 10) {
            return new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-0' + today.getDate());
        } else {
            return new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate());
        }
    }
}

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/:recordType/:date?', function (req, res, next) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
    var requestDate = req.params.date ? req.params.date : ParseToday();
    var recordInput = {
        recordDate: requestDate,
        recordType: requestRecordType
    }
    databaseFunction.getSystemBankList(req, function (err, systemBankObject) {
        if (err) {
            return res.send(err)
        }
        databaseFunction.getUniqueBank(req, function (err, uniqueBank) {
            if (err) {
                return res.send(err)
            }
            databaseFunction.findRecord(recordInput, function (err, recordObject) {
                if (err) {
                    return res.send(err)
                }
                var locked = recordObject ? recordObject.payOutPage.locked : false;

                return res.render('records/approve', {
                    title: 'Approve Pay Out (' + requestRecordType + ')',
                    payOutDetails: recordObject ? recordObject.payOutPage.payOutDetails : [],
                    uniqueBank: uniqueBank,
                    pageLocked: locked,
                    requestDate: requestDate,
                    redirectRecordType: req.params.recordType,
                    requestRecordType: requestRecordType,
                    systemBankObject: systemBankObject
                });
            });
        });

    });
});

router.post('/submit', function (req, res) {

    console.log(req.body);
    databaseFunction.approvePayOut(req.body, function (err) {
        if (err) {
            return res.send(err)
        }
        return res.redirect('/approve/' + req.body.redirectRecordType + '/' + req.body.requestDate);
    });

})

router.get('/unapprove/:payOutID/:recordType/:date', function (req, res) {

    databaseFunction.unapprovePayOut(req.params, function (err) {
        if (err) {
            return res.send(err)
        }
        return res.redirect('/approve/' + req.params.recordType + '/' + req.params.date);
    });


})

router.post('/lock', function (req, res) {
    var requestRecordType = (req.body.redirectRecordType).charAt(0).toUpperCase() + (req.body.redirectRecordType).substring(1).toLowerCase();
    var lockInput = {
        requestDate: req.body.requestDate,
        requestRecordType: requestRecordType,
        locked: req.body.locked
    }
    databaseFunction.lockPayOutPage(lockInput, function (err) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/approve/' + req.body.redirectRecordType + '/' + req.body.requestDate);
    });

});

module.exports = router;
