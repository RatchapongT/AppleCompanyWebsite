var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/database-function');
var underscore = require('underscore');
router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});


/* ================== */

router.get('/manage/:recordType/initialize-record/:date?', function (req, res, next) {

    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
        var today = new Date();
        var requestDate = null;
        if (today.getMonth() + 1 < 10) {
            if (today.getDate() < 10) {
                requestDate = new Date(today.getFullYear() + '-0' + (today.getMonth() + 1) + '-0' + today.getDate());
            } else {
                requestDate = new Date(today.getFullYear() + '-0' + (today.getMonth() + 1) + '-' + today.getDate());
            }

        } else {
            if (today.getDate() < 10) {
                requestDate = new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-0' + today.getDate());
            } else {
                requestDate = new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate());
            }
        }

        var input = {
            date: req.params.date ? req.params.date : requestDate,
            recordType: requestRecordType
        }

        databaseFunction.findRecord(input, function (err, recordObject) {
            if (!recordObject) {
                databaseFunction.initializeRecord(input, function (err, result) {
                    if (err) {
                        return res.send(err);
                    }
                    return res.redirect('/records/manage/' + req.params.recordType + '/initialize-record/' + input.date);
                });
            } else {
                return res.redirect('/records/manage/' + req.params.recordType + '/update-entry/' + input.date + '/' + recordObject.id);
            }
        });

    } else {
        return res.send("Invalid Request");
    }


});

router.post('/manage/:recordType/initialize-record/:date?', function (req, res, next) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        return res.redirect('/records/manage/' + req.params.recordType + '/initialize-record/' + req.params.date);
    } else {
        return res.send("Invalid Request");
    }

});

router.get('/manage/:recordType/update-entry/:date/:recordPageID', function (req, res, next) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
        var input = {
            date: req.params.date,
            recordPageID: req.params.recordPageID,
            customerType: requestRecordType
        }

        databaseFunction.createEntry(input, function (err) {
            if (err) {
                return res.send(err);
            }
            databaseFunction.findEntry(input, function (err, organizedEntryObject) {
                databaseFunction.findRecordByID(input.recordPageID, function (err, recordObject) {
                    return res.render('records/manage', {
                            title: 'Payment Management (' + requestRecordType + ')',
                            organizedEntryObject: organizedEntryObject,
                            recordPageID: req.params.recordPageID,
                            requestRecordType: requestRecordType,
                            redirectRecordType: req.params.recordType,
                            requestDate: input.date,
                            pageLocked: recordObject.locked,
                            totalSale: recordObject.totalSale,
                            totalStrike: recordObject.totalStrike
                        }
                    )
                });
            });
        });
    } else {
        return res.send("Invalid Request");
    }
});

router.post('/manage/:recordType/update-entry/', function (req, res, next) {
    console.log("HJI");
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
        var input = {
            customer_id: req.body.customer_id,
            date: req.body.date,
            sale: req.body.sale,
            strike: req.body.strike,
            customerType: requestRecordType,
            recordPageID: req.body.recordPageID
        }
        databaseFunction.findRecordByID(input.recordPageID, function (err, recordObject) {
            if (recordObject.locked) {
                return res.send("Document is locked");
            } else {
                databaseFunction.updateEntry(input, function (err, object) {
                    if (err) {
                        return res.send(err);
                    }
                    console.log('/records/manage/' + req.params.recordType + '/update-entry/' + input.date + '/' + input.recordPageI);
                    return res.redirect('/records/manage/' + req.params.recordType + '/update-entry/' + input.date + '/' + input.recordPageID);
                });
            }
        });
    } else {
        return res.send("Invalid Request");
    }


});

router.post('/lock-page/:recordType', function (req, res, next) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        databaseFunction.lockPage(req.body, function (err, object) {
            if (err) {
                return res.send(err);
            }
            return res.redirect('/records/manage/' + req.params.recordType + '/update-entry/' + req.body.date + '/' + req.body.recordPageID);
        });
    } else {
        return res.send("Invalid Request");
    }

});


router.get('/centralsheet/:recordType/:id?', function (req, res) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();


        var reqInput = {
            malay: req.params.recordType == 'malay',
            thai: req.params.recordType == 'thai'
        }
        databaseFunction.getCustomerTypeList(reqInput, function (err, customerObject) {
            if (err) {
                return res.send(err);
            }
            var requestCustomer_id = req.params.id ? req.params.id : customerObject[0]._id;
            var input = {
                requestCustomer_id: requestCustomer_id,
                requestRecordType: requestRecordType
            };

            databaseFunction.getCustomerFinancialHistory(input, function (err, financeObject) {
                if (err) {
                    return res.send(err);
                }
                return res.render('records/centralsheet', {
                    title: 'Central Sheet (' + requestRecordType + ')',
                    customerObject: customerObject,
                    requestCustomerID: req.params.id,
                    financeObject: financeObject,
                    redirectRecordType: req.params.recordType
                });
            });

        });
    }
    else {
        return res.send("Invalid Request");
    }

})
;

router.post('/centralsheet/:recordType', function (req, res) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        return res.redirect('/records/centralsheet/' + req.params.recordType + '/' + req.body.request_customer_id);
    } else {
        return res.send("Invalid Request");
    }
});


module.exports = router;

