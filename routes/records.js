var express = require('express');
var router = express.Router();
var databaseService = require('../services/database-service');

var User = require('../models/database').User;
var Relationship = require('../models/database').Relationship;
var Customer = require('../models/database').Customer;
var Bank = require('../models/database').Bank;
var Entry = require('../models/database').Entry;
var Record = require('../models/database').Record;
var async = require('async');

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});


router.get('/manage', function (req, res, next) {
    if (req.session.passport.user.accountType == "Admin") {
        var date = new Date();
        var requestDate = null;
        if (date.getMonth() + 1 < 10) {
            requestDate = new Date(date.getFullYear() + '-0' + (date.getMonth() + 1) + '-' + date.getDate());
        } else {
            requestDate = new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
        }

        Entry.find({recordDate: requestDate}, function (err, entryObject) {
            if (err) {
                return res.send(err);
            }
            Record.findOne({recordDate: requestDate}, function (err, object) {
                if (err) {
                    return res.send(err);
                }
                databaseService.getWorkerList(req, function (err, workerObject) {
                    if (err) {
                        return res.send(err);
                    }

                    if (object) {
                        return res.render('records/manageA', {
                                title: 'Record Management',
                                data: object,
                                requestDate: requestDate,
                                workerObject: workerObject,
                                entryObject: entryObject
                            }
                        )
                    } else {
                        var newRecord = new Record({
                            recordDate: requestDate
                        });

                        newRecord.save(function (err) {
                            if (err) {
                                return res.send(err);
                            }
                            return res.redirect('/records/manage');
                        });
                    }
                });
            });
        });



    }
});

router.post('/update', function (req, res, next) {

    var customerLoop = req.body.customerID;
    var saleLoop = req.body.sale;
    var strikeLoop = req.body.strike;
    async.each(customerLoop, function (data, callback) {
        var index = customerLoop.indexOf(data);
        Entry.findOneAndUpdate({
            recordDate: req.body.date,
            customerID: customerLoop[index]
        }, {
            recordDate: req.body.date,
            customerID: customerLoop[index],
            sale: saleLoop[index],
            strike: strikeLoop[index],
        }, {upsert: true}, function (err, object) {
            if (err) {
                return res.send(err);
            }
        });

    }, function (error) {
        if (error) {
            return res.send(err);
        }
    });

});

router.post('/lock', function (req, res, next) {


    Record.findOneAndUpdate({recordDate: req.body.date}, {
        $set: {
            locked: req.body.locked
        }
    }, function (err, object) {
        if (err) {
            return res.send(err);
        }
        return res.redirect('/records/manage');
    });
});

module.exports = router;


