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

router.get('/', function (req, res) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/initialize/:recordType/:date?/:requestUserID?', function (req, res) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
    var requestDate = req.params.date ? req.params.date : ParseToday();
    var recordInput = {
        recordDate: requestDate,
        recordType: requestRecordType
    }
    databaseFunction.getSystemBankList(req, function (err, systemBankObject) {
        databaseFunction.getUniqueSystemBank(req, function (err, uniqueBank) {

            databaseFunction.findRecord(recordInput, function (err, recordObject) {

                if (recordObject == null) {
                    var returnString = '&payin&initialize&' + req.params.recordType + '&' + recordInput.recordDate;
                    return res.redirect('/records/create/' + req.params.recordType + '/' + recordInput.recordDate + '/' + returnString);
                } else {
                    var locked = recordObject.payInPage.locked ? recordObject.payInPage.locked : false;
                    var userArray = []
                    var workerList = underscore.pluck(recordObject.hierarchy, 'workers');
                    for (var i = 0; i < workerList.length; i++) {
                        var partnerList = underscore.pluck(workerList[i], 'partners');
                        for (var j = 0; j < partnerList.length; j++) {
                            for (var k = 0; k < partnerList[j].length; k++) {
                                userArray.push({
                                    id: partnerList[j][k].partnerProfiles.partner_id,
                                    userID: partnerList[j][k].partnerProfiles.partnerID,
                                    userNickname: partnerList[j][k].partnerProfiles.partnerNickname
                                })
                            }
                        }
                    }

                    for (var i = 0; i < workerList.length; i++) {
                        var customerList = underscore.pluck(workerList[i], 'customers');
                        for (var j = 0; j < customerList.length; j++) {
                            for (var k = 0; k < customerList[j].length; k++) {
                                userArray.push({
                                    id: customerList[j][k].customerProfiles.customer_id,
                                    userID: customerList[j][k].customerProfiles.customerID,
                                    userNickname: customerList[j][k].customerProfiles.customerNickname
                                })
                            }
                        }
                    }
                    var requestPayment_id = req.params.payment_id ? req.params.payment_id : (systemBankObject[0] ? systemBankObject[0]._id : null);
                    var requestUserID = req.params.requestUserID ? req.params.requestUserID : (userArray[0] ? userArray[0].id : null);
                    return res.render('records/payin', {
                        title: 'Pay In (' + requestRecordType + ')',
                        userArray: userArray,
                        pageLocked: locked,
                        requestDate: requestDate,
                        requestUserID: requestUserID,
                        redirectRecordType: req.params.recordType,
                        payInDetails: recordObject.payInPage.payInDetails,
                        uniqueBank: uniqueBank,
                        systemBankObject:systemBankObject,
                        requestPaymentID: requestPayment_id
                    })
                }
            });
        });
    });
});

router.post('/submit', function (req, res) {
    var requestRecordType = (req.body.redirectRecordType).charAt(0).toUpperCase() + (req.body.redirectRecordType).substring(1).toLowerCase();
    var userObject = JSON.parse(req.body.json_object);
    var bankObject = JSON.parse(req.body.json_bank);
    var recordInput = {
        recordDate: req.body.requestDate,
        recordType: requestRecordType
    }

    databaseFunction.findRecord(recordInput, function (err, recordObject) {
        var locked = recordObject.payInPage.locked ? recordObject.payInPage.locked : false;

        if (!locked) {
            var updateInput = {
                requestRecordType: requestRecordType,
                requestDate: req.body.requestDate,
                reportedUsername: req.session.passport.user.username,
                reportedUserNickname: req.session.passport.user.nickname,
                user_id: userObject.id,
                userID: userObject.username,
                userNickname: userObject.nickname,
                payIn: req.body.payIn,
                paymentMethodBankName: bankObject.bankName,
                paymentMethodBankNumber: bankObject.bankNumber,
                paymentMethodBankType: bankObject.bankType
            }

            databaseFunction.updatePayIn(updateInput, function (err) {
                if (err) {
                    return res.send(err)
                }
                return res.redirect('/payin/initialize/' + req.body.redirectRecordType + '/' + req.body.requestDate + '/' + userObject.id);

            });
        } else {
            return res.render('warning',
                {
                    title: 'Warning',
                    warningText: "Document Locked!"
                }
            );
        }

    });
});

router.post('/change/:date', function (req, res) {
    console.log(req.body);
    return res.redirect('/payin/initialize/' + req.body.redirectRecordType + '/' + req.params.date + '/' + req.body.requestUserID);
});

router.post('/lock', function (req, res) {
    var requestRecordType = (req.body.redirectRecordType).charAt(0).toUpperCase() + (req.body.redirectRecordType).substring(1).toLowerCase();
    var lockInput = {
        requestDate: req.body.requestDate,
        requestRecordType: requestRecordType,
        locked: req.body.locked
    }
    databaseFunction.lockPayInPage(lockInput, function (err) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/payin/initialize/' + req.body.redirectRecordType + '/' + req.body.requestDate + '/' + req.body.requestUserID);
    });

});


router.get('/delete/:payInID/:recordType/:date/:userID', function (req, res) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();

    var recordInput = {
        recordDate: req.params.date,
        recordType: requestRecordType
    }
    databaseFunction.findRecord(recordInput, function (err, recordObject) {
        var locked = recordObject.payInPage.locked ? recordObject.payInPage.locked : false;

        if (!locked) {
            var deleteInput = {
                requestRecordType: requestRecordType,
                requestDate: req.params.date,
                payInID: req.params.payInID
            }
            databaseFunction.deletePayIn(deleteInput, function (err) {
                if (err) {
                    return res.send(err);
                }
                return res.redirect('/payin/initialize/' + req.params.recordType + '/' + req.params.date + '/' + req.params.userID);
            });
        } else {
            return res.render('warning',
                {
                    title: 'Warning',
                    warningText: "Document Locked!"
                }
            );
        }

    });
});

module.exports = router;
