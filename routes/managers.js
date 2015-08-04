var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/managers');


router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/assign/:id?', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.getUnownedWorkerList(req, function (err, unownedWorkerObject) {
            if (err) {
                return res.send(err);
            }
            databaseFunction.getManagerList(req, function (err, managerObject) {
                if (err) {
                    return res.send(err);
                }
                databaseFunction.getManagerWorkerRelationship(req, function (err, managerWorkerObject) {
                    if (err) {
                        return res.send(err);
                    }

                    return res.render('managers/assign', {
                        title: 'Assign Worker',
                        managerObject: managerObject,
                        managerWorkerObject: managerWorkerObject,
                        unownedWorkerObject: unownedWorkerObject,
                        requestManagerID: req.params.id,
                        error: req.flash('error')
                    });
                });
            });
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }
});

router.post('/assign', function (req, res) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.assignWorker(req.body, function (err, workerObject) {
            if (err) {
                return res.send(err);
            }
            return res.redirect('/managers/assign/' + req.body.requestManagerID);
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }
});


router.get('/delete_relationship/:workerID/:requestManagerID', function (req, res, next) {
    if (req.session.passport.user.accountType == "Admin") {
        databaseFunction.deleteManagerWorkerRelationship(req.params, function (err) {
            if (err) {
                return res.send(err);
            }

            return res.redirect('/managers/assign/' + req.params.requestManagerID);
        });
    } else {
        return res.render('warning',
            {
                title: 'Warning',
                warningText: "No Permission"
            }
        );
    }
});

module.exports = router;

