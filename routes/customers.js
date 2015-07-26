var express = require('express');
var router = express.Router();
var databaseService = require('../services/database-service');
var Customer = require('../models/database').Customer;
var User = require('../models/database').User;

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user
    });
});


module.exports = router;
