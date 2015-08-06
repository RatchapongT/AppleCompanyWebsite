var express = require('express');
var router = express.Router();
var databaseFunction = require('../../services/records');
var underscore = require('underscore');
var escape = require('escape-html');

var ManagerWorker = require('../../models/databaseModels').ManagerWorker;
var WorkerCustomer = require('../../models/databaseModels').WorkerCustomer;
var WorkerPartner = require('../../models/databaseModels').WorkerPartner;
var Customer = require('../../models/databaseModels').Customer;
var Worker = require('../../models/databaseModels').Worker;
var Manager = require('../../models/databaseModels').Manager;

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



router.get('/test', function (req, res,next) {

});
router.get('/initialize/:recordType/:date?', function (req, res) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
    var requestDate = req.params.date ? req.params.date : ParseToday();
    var recordInput = {
        recordDate: requestDate,
        recordType: requestRecordType
    }
    databaseFunction.findRecord(recordInput, function (err, recordObject) {
        if (recordObject == null) {
            var returnString = '&profitloss&initialize&' + req.params.recordType + '&' + recordInput.recordDate;
            return res.redirect('/records/create/' + req.params.recordType + '/' + recordInput.recordDate + '/' + returnString);
        } else {
            return res.render('records/profitloss', {
                    title: 'Payment Management (' + requestRecordType + ')',
                    hierarchy: recordObject.hierarchy,
                    requestRecordType: requestRecordType,
                    redirectRecordType: req.params.recordType,
                    requestDate: requestDate,
                    permission: req.session.passport.user.accountType,
                    pageLocked: recordObject ? recordObject.profitLossPage.locked : false,
                    sellDetails: recordObject ? recordObject.profitLossPage.sellDetails : null,
                    buyDetails: recordObject ? recordObject.profitLossPage.buyDetails : null,
                    totalSale: 0,
                    totalStrike: 0,
                }
            )
        }
    });

});

module.exports = router;
