var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/database-function');

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

/* THAI */

router.get('/manage-thai/initialize-record/:date?', function (req, res, next) {

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
        recordType: "Thai"
    }

    databaseFunction.findRecord(input, function (err, recordObject) {
        if (!recordObject) {
            databaseFunction.initializeRecord(input, function (err, result) {
                if (err) {
                    return res.send(err);
                }
                return res.redirect('/records/manage-thai/initialize-record/' + input.date);
            });
        } else {
            return res.redirect('/records/manage-thai/update-entry/' + input.date + '/' + recordObject.id);
        }
    });
});

router.post('/manage-thai/initialize-record/:date?', function (req, res, next) {

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
        recordType: "Thai"
    }
    databaseFunction.findRecord(input, function (err, recordObject) {
        if (!recordObject) {
            databaseFunction.initializeRecord(input, function (err, result) {
                if (err) {
                    return res.send(err);
                }
                return res.redirect('/records/manage-thai/initialize-record/' + input.date);
            });
        } else {
            return res.redirect('/records/manage-thai/update-entry/' + input.date + '/' + recordObject.id);
        }
    });
});

router.get('/manage-thai/update-entry/:date/:recordPageID', function (req, res, next) {
    var input = {
        date: req.params.date,
        recordPageID: req.params.recordPageID,
        customerType: "Thai"
    }


    databaseFunction.createEntry(input, function (err) {
        if (err) {
            return res.send(err);
        }
        databaseFunction.findEntry(input, function (err, organizedEntryObject) {
            databaseFunction.findRecordByID(input.recordPageID, function (err, recordObject) {
                return res.render('records/manage-thai', {
                        title: 'Payment Management (Thai)',
                        organizedEntryObject: organizedEntryObject,
                        recordPageID: req.params.recordPageID,
                        requestDate: input.date,
                        pageLocked: recordObject.locked,
                        totalSale: recordObject.totalSale,
                        totalStrike: recordObject.totalStrike
                    }
                )
            });
        });
    });


});

router.post('/manage-thai/update-entry/', function (req, res, next) {

    var input = {
        customer_id: req.body.customer_id,
        date: req.body.date,
        sale: req.body.sale,
        strike: req.body.strike,
        customerType: "Thai",
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
                return res.redirect('/records/manage-thai/update-entry/' + input.date + '/' + input.recordPageID);
            });
        }

    });

});


/* MALAY */

router.get('/manage-malay/initialize-record/:date?', function (req, res, next) {

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
        recordType: "Malay"
    }
    databaseFunction.findRecord(input, function (err, recordObject) {
        if (!recordObject) {
            databaseFunction.initializeRecord(input, function (err, result) {
                if (err) {
                    return res.send(err);
                }
                return res.redirect('/records/manage-malay/initialize-record/' + input.date);
            });
        } else {
            return res.redirect('/records/manage-malay/update-entry/' + input.date + '/' + recordObject.id);
        }
    });
});

router.post('/manage-malay/initialize-record/:date?', function (req, res, next) {

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
        recordType: "Malay"
    }
    databaseFunction.findRecord(input, function (err, recordObject) {
        if (!recordObject) {
            databaseFunction.initializeRecord(input, function (err, result) {
                if (err) {
                    return res.send(err);
                }
                return res.redirect('/records/manage-malay/initialize-record/' + input.date);
            });
        } else {
            return res.redirect('/records/manage-malay/update-entry/' + input.date + '/' + recordObject.id);
        }
    });
});

router.get('/manage-malay/update-entry/:date/:recordPageID', function (req, res, next) {
    var input = {
        date: req.params.date,
        recordPageID: req.params.recordPageID,
        customerType: "Malay"
    }


    databaseFunction.createEntry(input, function (err) {
        if (err) {
            return res.send(err);
        }
        databaseFunction.findEntry(input, function (err, organizedEntryObject) {
            databaseFunction.findRecordByID(input.recordPageID, function (err, recordObject) {
                return res.render('records/manage-malay', {
                        title: 'Payment Management (Malay)',
                        organizedEntryObject: organizedEntryObject,
                        recordPageID: req.params.recordPageID,
                        requestDate: input.date,
                        pageLocked: recordObject.locked,
                        totalSale: recordObject.totalSale,
                        totalStrike: recordObject.totalStrike
                    }
                )
            });
        });
    });

});

router.post('/manage-malay/update-entry/', function (req, res, next) {

    var input = {
        customer_id: req.body.customer_id,
        date: req.body.date,
        sale: req.body.sale,
        strike: req.body.strike,
        customerType: "Malay",
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
                return res.redirect('/records/manage-malay/update-entry/' + input.date + '/' + input.recordPageID);
            });
        }

    });


});

router.post('/lock-malay-page', function (req, res, next) {
    console.log(req.body);
    databaseFunction.lockPage(req.body, function (err, object) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/records/manage-malay/update-entry/' + req.body.date + '/' + req.body.recordPageID);
    });
});

router.post('/lock-thai-page', function (req, res, next) {

    console.log(req.body);
    databaseFunction.lockPage(req.body, function (err, object) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/records/manage-malay/update-entry/' + req.body.date + '/' + req.body.recordPageID);
    });
});


router.get('/centralsheet-malay/:id?', function (req, res) {
    databaseFunction.getCustomerList(req, function (err, customerObject) {
        if (err) {
            return res.send(err);
        }

        var requestCustomerID = req.params.id ? req.params.id :customerObject[0]._id;
        databaseFunction.getCustomerFinancialHistory(requestCustomerID, function(err, financeObject) {
            if (err) {
                return res.send(err);
            }
            return res.render('records/centralsheet-malay', {
                title: 'Central Sheet (Malay)',
                customerObject: customerObject,
                requestCustomerID: req.params.id,
                financeObject: financeObject
            });
        });

    });
});

router.post('/centralsheet-malay', function (req, res) {
    return res.redirect('/records/centralsheet-malay/' + req.body.request_customer_id);
});

module.exports = router;

