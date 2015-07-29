var express = require('express');
var router = express.Router();
var databaseService = require('../services/database-service');

var User = require('../models/database').User;
var Relationship = require('../models/database').Relationship;
var Customer = require('../models/database').Customer;
var Bank = require('../models/database').Bank;

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});


router.get('/manage', function (req, res, next) {
    res.render('records/manage', {
        title: 'Record',
        currentUser: req.session.passport.user.username
    });
});

module.exports = router;
