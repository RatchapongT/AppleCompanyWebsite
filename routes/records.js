var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/records');
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


router.get('/initialize/:recordType/:page/:date?/:customer_id?/:payment_id?', function (req, res, next) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
        var requestDate = req.params.date ? req.params.date : ParseToday();

        var recordInput = {
            date: requestDate,
            recordType: requestRecordType
        }

        databaseFunction.findRecord(recordInput, function (err, recordObject) {
            if (recordObject == null) {
                databaseFunction.initializeRecord(recordInput, function (err, result) {
                    if (err) {
                        return res.send(err);
                    }
                    if (req.params.customer_id != undefined && req.params.payment_id != undefined) {
                        return res.redirect('/records/initialize/' + req.params.recordType + '/' + req.params.page + '/' + requestDate + '/' + req.params.customer_id + '/' + req.params.payment_id);

                    } else {
                        return res.redirect('/records/initialize/' + req.params.recordType + '/' + req.params.page + '/' + requestDate);
                    }
                });
            } else {
                var entryInput = {
                    date: requestDate,
                    customerType: requestRecordType,
                    recordPageID: recordObject.id
                }

                databaseFunction.createEntry(entryInput, function (err) {
                    if (err) {
                        return res.send(err);
                    }
                    if (req.params.page == 'payin') {
                        if (req.params.customer_id != undefined && req.params.payment_id != undefined) {
                            return res.redirect('/records/payin/' + req.params.recordType + '/' + requestDate + '/' + req.params.customer_id + '/' + req.params.payment_id);

                        } else {
                            return res.redirect('/records/payin/' + req.params.recordType + '/' + requestDate);
                        }
                    }

                    if (req.params.page == 'payout') {
                        if (req.params.customer_id != undefined) {
                            return res.redirect('/records/payout/' + req.params.recordType + '/' + requestDate + '/' + req.params.customer_id);

                        } else {
                            return res.redirect('/records/payout/' + req.params.recordType + '/' + requestDate);
                        }
                    }

                    if (req.params.page == 'manage') {
                        return res.redirect('/records/manage/' + req.params.recordType + '/' + requestDate);
                    }
                });


            }
        });
    }
});

router.post('/initialize/:recordType/manage/:date', function (req, res, next) {

    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        return res.redirect('/records/initialize/' + req.params.recordType + '/manage/' + req.params.date);
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "Malay or Thai Only"
            }
        );
    }
});

router.get('/manage/:recordType/:date', function (req, res, next) {

    if (req.session.passport.user.accountType == "Worker") {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    } else {


        if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
            var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();

            var recordInput = {
                date: req.params.date,
                recordType: requestRecordType
            }
            databaseFunction.findRecord(recordInput, function (err, recordObject) {
                if (err) {
                    return res.send(err);
                }
                if (req.session.passport.user.accountType == "Admin") {
                    var entryInput = {
                        recordDate: req.params.date,
                        customerType: requestRecordType
                    }
                }
                if (req.session.passport.user.accountType == "Manager") {
                    var entryInput = {
                        recordDate: req.params.date,
                        customerType: requestRecordType,
                        manager_id: req.session.passport.user.managerID
                    }
                }
                databaseFunction.findEntry(entryInput, function (err, organizedEntryObject) {
                    if (err) {
                        return res.send(err);
                    }
                    databaseFunction.getRecordInfo(recordInput, function (err, recordInfoObject) {
                        if (err) {
                            return res.send(err);
                        }
                        return res.render('records/manage', {
                                title: 'Payment Management (' + requestRecordType + ')',
                                organizedEntryObject: organizedEntryObject ? organizedEntryObject : null,
                                requestRecordType: requestRecordType,
                                redirectRecordType: req.params.recordType,
                                requestDate: req.params.date,
                                recordPageID: recordObject ? recordObject.id : null,
                                pageLocked: recordObject ? recordObject.locked : null,
                                totalSale: recordInfoObject ? recordInfoObject.totalSale : null,
                                totalStrike: recordInfoObject ? recordInfoObject.totalStrike : null,
                            }
                        )
                    });

                });
            });
        } else {
            return res.render('warning',
                {
                    title: 'Warning',
                    warningText: "Malay or Thai Only"
                }
            );
        }
    }


});

router.post('/manage/:recordType/update-entry/', function (req, res, next) {
    if (req.session.passport.user.accountType == "Worker") {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    } else {
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
                    return res.render('warning',
                        {
                            title: 'Warning',
                            warningText: "Document Locked!"
                        }
                    );
                } else {
                    databaseFunction.updateEntry(input, function (err, object) {
                        if (err) {
                            return res.send(err);
                        }
                        return res.redirect('/records/manage/' + req.params.recordType + '/' + input.date);
                    });
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
    }


});


router.get('/payin/:recordType/:date/:customer_id?/:payment_id?', function (req, res) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var requestDate = req.params.date;
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
        if (req.params.recordType == 'thai') {
            var query = {
                thai: true
            }
        }
        if (req.params.recordType == 'malay') {
            var query = {
                malay: true
            }
        }
        databaseFunction.getSystemBankList(req, function (err, systemBankObject) {
            if (err) {
                return res.send(err);
            }
            databaseFunction.getCustomerTypeList(query, function (err, customerObject) {
                if (err) {
                    return res.send(err);
                }
                var requestPayment_id = req.params.payment_id ? req.params.payment_id : (systemBankObject[0] ? systemBankObject[0]._id : null);
                var requestCustomer_id = req.params.customer_id ? req.params.customer_id : (customerObject[0] ? customerObject[0]._id : null);

                if (req.session.passport.user.accountType == "Manager") {
                    var filterdObject = underscore.filter(customerObject, function(obj) {
                        return obj._workerDetail._managerDetail == req.session.passport.user.managerID;
                    });
                    customerObject = filterdObject;
                }

                if (req.session.passport.user.accountType == "Worker") {
                    var filterdObject = underscore.filter(customerObject, function (obj) {
                        return obj._workerDetail._id == req.session.passport.user.workerID;
                    });
                    customerObject = filterdObject;
                }

                var entryInput = {
                    requestDate: requestDate,
                    requestRecordType: requestRecordType
                }
                databaseFunction.getEntryPayIn(entryInput, function (err, entryObject) {
                    if (err) {
                        return res.send(err);
                    }
                    return res.render('records/payin', {
                        title: 'Pay In (' + requestRecordType + ')',
                        customerObject: customerObject,
                        systemBankObject: systemBankObject ? systemBankObject : null,
                        requestPaymentID: requestPayment_id,
                        requestCustomerID: requestCustomer_id,
                        requestDate: requestDate,
                        redirectRecordType: req.params.recordType,
                        entryObject: entryObject ? entryObject : null
                    });
                });


            });

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

router.post('/payin/:recordType/:date/:customer_id/:payment_id', function (req, res) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        return res.redirect('/records/initialize/' + req.params.recordType + '/payin/' + req.params.date + '/' + req.params.customer_id + '/' + req.params.payment_id);
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "Malay or Thai Only"
            }
        );
    }
});

router.post('/payin/:recordType', function (req, res) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var recordInput = {
            date: req.body.requestDate,
            recordType: requestRecordType
        };

        databaseFunction.findRecord(recordInput, function (err, recordObject) {
            if (recordObject.locked) {
                return res.render('warning',
                    {
                        title: 'Warning',
                        warningText: "Document Locked!"
                    }
                );
            } else {
                var updateInput = {
                    requestDate: req.body.requestDate,
                    requestCustomerID: req.body.requestCustomerID,
                    customerType: requestRecordType,
                    requestBankID: req.body.requestPaymentID,
                    payIn: req.body.payIn
                };
                databaseFunction.updatePayIn(updateInput, function (err) {
                    if (err) {
                        return res.send(err);
                    }
                    return res.redirect('/records/payin/' + req.params.recordType + '/' + req.body.requestDate + '/' + req.body.requestCustomerID + '/' + req.body.requestBankID);
                });
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

router.get('/payin/:recordType/delete/:date/:customer_id/:payment_id/:entry_id/:delete_id', function (req, res, next) {
    databaseFunction.deletePayIn(req.params, function (err) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/records/payin/' + req.params.recordType + '/' + req.params.date + '/' + req.params.customer_id + '/' + req.params.payment_id);
    });
});


router.get('/payout/:recordType/:date/:customer_id?/', function (req, res) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var requestDate = req.params.date;
        var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();

        if (req.params.recordType == 'thai') {
            var query = {
                thai: true
            }
        }
        if (req.params.recordType == 'malay') {
            var query = {
                malay: true
            }
        }


        databaseFunction.getCustomerTypeList(query, function (err, customerObject) {
            if (err) {
                return res.send(err);
            }

            if (req.session.passport.user.accountType == "Manager") {
                var filterdObject = underscore.filter(customerObject, function(obj) {
                    return obj._workerDetail._managerDetail == req.session.passport.user.managerID;
                });
                customerObject = filterdObject;
            }

            if (req.session.passport.user.accountType == "Worker") {
                var filterdObject = underscore.filter(customerObject, function (obj) {
                    return obj._workerDetail._id == req.session.passport.user.workerID;
                });
                customerObject = filterdObject;
            }

            var requestCustomer_id = req.params.customer_id ? req.params.customer_id : (customerObject[0] ? customerObject[0]._id : null);

            var entryInput = {
                requestDate: requestDate,
                requestRecordType: requestRecordType
            }
            databaseFunction.getEntryPayOut(entryInput, function (err, entryObject) {
                if (err) {
                    return res.send(err);
                }

                return res.render('records/payout', {
                    title: 'Pay Out (' + requestRecordType + ')',
                    customerObject: customerObject ? customerObject : null,
                    requestCustomerID: requestCustomer_id,
                    requestDate: requestDate,
                    redirectRecordType: req.params.recordType,
                    entryObject: entryObject ? entryObject : null,
                });

            });
        });
    }
    else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "Malay or Thai Only"
            }
        );
    }
})
;

router.post('/payout/:recordType/:date/:customer_id/', function (req, res) {

    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        return res.redirect('/records/initialize/' + req.params.recordType + '/payout/' + req.params.date + '/' + req.params.customer_id);
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "Malay or Thai Only"
            }
        );
    }
});

router.post('/payout/:recordType', function (req, res) {
    var requestRecordType = (req.params.recordType).charAt(0).toUpperCase() + (req.params.recordType).substring(1).toLowerCase();
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        var recordInput = {
            date: req.body.requestDate,
            recordType: requestRecordType
        };

        databaseFunction.findRecord(recordInput, function (err, recordObject) {
            if (recordObject.locked) {
                return res.render('warning',
                    {
                        title: 'Warning',
                        warningText: "Document Locked!"
                    }
                );
            } else {
                var updateInput = {
                    requestDate: req.body.requestDate,
                    requestCustomerID: req.body.requestCustomerID,
                    customerType: requestRecordType,
                    payOut: req.body.payOut

                };
                databaseFunction.updatePayOut(updateInput, function (err) {
                    if (err) {
                        return res.send(err);
                    }
                    return res.redirect('/records/payout/' + req.params.recordType + '/' + req.body.requestDate + '/' + req.body.requestCustomerID);
                });
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

router.get('/payout/:recordType/delete/:date/:customer_id/:entry_id/:delete_id', function (req, res, next) {
    databaseFunction.deletePayOut(req.params, function (err) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/records/payout/' + req.params.recordType + '/' + req.params.date + '/' + req.params.customer_id);
    });
});


router.post('/lock-page/:recordType', function (req, res, next) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        databaseFunction.lockPage(req.body, function (err, object) {
            if (err) {
                return res.send(err);
            }

            return res.redirect('/records/manage/' + req.params.recordType + '/' + req.body.date);
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
            var requestCustomer_id = req.params.id ? req.params.id : (customerObject[0] ? customerObject[0]._id : null);
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
                    customerObject: customerObject ? customerObject : null,
                    requestCustomerID: requestCustomer_id,
                    financeObject: financeObject ? financeObject : null,
                    redirectRecordType: req.params.recordType,
                });
            });

        });
    }
    else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "Malay or Thai Only"
            }
        );
    }

});

router.post('/centralsheet/:recordType', function (req, res) {
    if (req.params.recordType == 'malay' || req.params.recordType == 'thai') {
        return res.redirect('/records/centralsheet/' + req.params.recordType + '/' + req.body.request_customer_id);
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "Malay or Thai Only"
            }
        );
    }
});
module.exports = router;


