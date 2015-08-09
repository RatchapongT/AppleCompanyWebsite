var express = require('express');
var router = express.Router();
var databaseFunction = require('../../services/records');


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
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
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
                        recordObject: recordObject ? recordObject : null
                    }
                )
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


router.post('/submit', function (req, res) {
    var requestRecordType = (req.body.requestRecordType).charAt(0).toUpperCase() + (req.body.requestRecordType).substring(1).toLowerCase();
    var requestDate = req.body.requestDate ? req.body.requestDate : ParseToday();
    var recordInput = {
        recordDate: requestDate,
        recordType: requestRecordType
    }
    databaseFunction.findRecord(recordInput, function (err, recordObject) {
        var locked = recordObject.profitLossPage.locked ? recordObject.profitLossPage.locked : false;
        if (!locked) {
            var updateInput = {
                recordDate: req.body.requestDate,
                recordType: req.body.requestRecordType,
                sellDetails_id: req.body.sellDetails_id,
                sale: req.body.sale,
                strike: req.body.strike,
                buyDetails_id: req.body.buyDetails_id,
                buy: req.body.buy,
                win: req.body.win
            }
            databaseFunction.updateRecord(updateInput, function(err) {
                if (err) {
                    return res.send(err);
                }
                return res.redirect('/profitloss/initialize/'+ req.body.redirectRecordType+ '/' + req.body.requestDate);
            })
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

router.post('/change/:redirectRecordType/:date', function (req, res) {
    return res.redirect('/profitloss/initialize/' + req.params.redirectRecordType + '/' + req.params.date);
});


router.post('/lock', function (req, res) {
    console.log(req.body);
    databaseFunction.lockProfitLossPage(req.body, function (err) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/profitloss/initialize/'+ req.body.redirectRecordType+ '/' + req.body.requestDate);
    });
});

module.exports = router;
