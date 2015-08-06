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

router.get('/create/:recordType/:date/:returnString', function (req, res) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
        databaseFunction.findRecord({
            recordDate: req.params.date,
            recordType: requestRecordType
        }, function (err, recordObject) {
            if (err) {
                return res.send(err);
            }
            if (recordObject == null) {
                return res.render('records/create', {
                    title: 'Create Record',
                    requestRecordType: requestRecordType,
                    requestDate: req.params.date,
                    returnString: req.params.returnString,
                });
            } else {
                return res.render('warning',
                    {
                        title: 'Warning',
                        warningText: "Document Already Created"
                    }
                );
            }
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "Malay or Thai Only"
            }
        );
    }

});

router.post('/create/:recordType', function (req, res) {
    var returnString = req.body.returnString;

    databaseFunction.findRecord({
        recordDate: req.body.requestDate,
        recordType: req.params.recordType
    }, function (err, recordObject) {
        if (err) {
            return res.send(err);
        }
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
        if (recordObject == null) {
            databaseFunction.getHierarchy({customerType: requestRecordType, partnerType: requestRecordType}, function(err, hierarchyObject) {
                    var recordInput = {
                        hierarchy: hierarchyObject.hierarchy,
                        customerArray: hierarchyObject.customerArray,
                        partnerArray: hierarchyObject.partnerArray,
                        recordDate: req.body.requestDate,
                        recordType: requestRecordType
                    }
                    databaseFunction.createRecord(recordInput, function (err) {
                        if (err) {
                            return res.send(err);
                        }

                        var url = returnString.split('&').join('/');
                        return res.redirect(url);
                    });
                });

        } else {
            return res.render('warning',
                {
                    title: 'Warning',
                    warningText: "Document Already Created"
                }
            );
        }
    });
});


module.exports = router;
