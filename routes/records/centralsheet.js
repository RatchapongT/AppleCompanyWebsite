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

router.get('/initialize/:recordType/partner/:requestID?', function (req, res, next) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
    var requestDate = req.params.date ? req.params.date : ParseToday();
    var recordInput = {
        recordDate: requestDate,
        recordType: requestRecordType
    }

    databaseFunction.findRecord(recordInput, function (err, recordObject) {
        if (err) {
            return res.send(err)
        }

        if (recordObject != null) {
            var userArray = [];
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
            var requestID = req.params.requestID ? req.params.requestID : (userArray[0] ? userArray[0].id : null);
            var centralSheetInput = {
                recordType: requestRecordType,
                requestID: requestID
            }

            console.log(userArray);
            databaseFunction.getCentralSheetPartner(centralSheetInput, function(err, financialObject) {
                return res.render('records/centralpartner', {
                    title: 'Central Sheet (' + requestRecordType + ')',
                    requestDate: requestDate,
                    redirectRecordType: req.params.recordType,
                    requestRecordType: requestRecordType,
                    userArray: userArray,
                    requestID: requestID,
                    financialObject : financialObject
                });
            });

        } else {
            return res.render('warning',
                {
                    title: 'Warning',
                    warningText: "No Record"
                }
            );
        }

    });

});


router.post('/change/partner', function (req, res) {

    return res.redirect('/centralsheet/initialize/' +req.body.redirectRecordType + '/partner/' + req.body.request_customer_id)


})


router.get('/initialize/:recordType/customer/:requestID?', function (req, res, next) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
    var requestDate = req.params.date ? req.params.date : ParseToday();
    var recordInput = {
        recordDate: requestDate,
        recordType: requestRecordType
    }

    databaseFunction.findRecord(recordInput, function (err, recordObject) {
        if (err) {
            return res.send(err)
        }

        if (recordObject != null) {
            var userArray = [];
            var workerList = underscore.pluck(recordObject.hierarchy, 'workers');
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
            var requestID = req.params.requestID ? req.params.requestID : (userArray[0] ? userArray[0].id : null);
            var centralSheetInput = {
                recordType: requestRecordType,
                requestID: requestID
            }

            console.log(userArray);
            databaseFunction.getCentralSheetCustomer(centralSheetInput, function(err, financialObject) {
                return res.render('records/centralcustomer', {
                    title: 'Central Sheet (' + requestRecordType + ')',
                    requestDate: requestDate,
                    redirectRecordType: req.params.recordType,
                    requestRecordType: requestRecordType,
                    userArray: userArray,
                    requestID: requestID,
                    financialObject : financialObject
                });
            });

        } else {
            return res.render('warning',
                {
                    title: 'Warning',
                    warningText: "No Record"
                }
            );
        }

    });

});


router.post('/change/customer', function (req, res) {

    return res.redirect('/centralsheet/initialize/' +req.body.redirectRecordType + '/customer/' + req.body.request_customer_id)


})


module.exports = router;
