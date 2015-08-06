var express = require('express');
var router = express.Router();
var databaseFunction = require('../../services/records');
var underscore = require('underscore');
var escape = require('escape-html');


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

router.get('/initialize/:recordType/:date?', function (req, res) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
    var recordInput = {
        recordDate: req.params.date ? req.params.date : ParseToday(),
        recordType: requestRecordType
    }
    databaseFunction.findRecord(recordInput, function (err, recordObject) {
        if (recordObject == null) {
            var returnString = '&payin&initialize&' + req.params.recordType + '&' + recordInput.recordDate;
            return res.redirect('/records/create/' + req.params.recordType + '/' + recordInput.recordDate + '/' + returnString);
        } else {
            return res.send("SUCCESS!");
        }
    });

});

module.exports = router;
