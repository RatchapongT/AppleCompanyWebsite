var express = require('express');
var router = express.Router();
var databaseService = require('../services/database-service');

var User = require('../models/database').User;
var Relationship = require('../models/database').Relationship;
var Customer = require('../models/database').Customer;
var Bank = require('../models/database').Bank;
var Record = require('../models/database').Record;

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});


router.get('/manage', function (req, res, next) {
    var date = new Date();

    if ((date.getMonth() + 1) < 10) {
        var requestDate = date.getDate() +'/0' + (date.getMonth() + 1) + '/' + date.getFullYear();
    } else {
        var requestDate = date.getDate() +'/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }

    res.render('records/manage', {
        title: 'Record',
        currentUser: req.session.passport.user.username,
        requestDate: requestDate
    });
});

module.exports = router;
