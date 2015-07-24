var express = require('express');
var router = express.Router();
var passport = require('passport');
var userService = require('../services/user-service');
var User = require('../models/user').User;


/* GET users listing. */
router.get('/', function (req, res, next) {
    var vm = {
        title: 'Homepage'
    };
    res.render('homepage', vm);
});


router.post('/create', function (req, res, next) {
    userService.addUser(req.body, function (err) {
        if (err) {
            console.log(err);
            var vm = {
                title: 'Create an account',
                input: req.body,
                error: err
            };
            req.flash('error', 'Username already exists');
            return res.redirect('/users/manage');
        }
        return res.redirect('/users/manage');
    });
});

router.get('/manage', function (req, res) {
    console.log(req.flash);
    userService.getUserList(req, function (err, object) {
        if (err) {
            console.log(err);
            var vm = {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            };
            return res.render('error', vm);
        }
        return res.render('manage', {data: object, error: req.flash('error')});
    });
});


router.get('/delete/:id', function (req, res) {
    userService.deleteUser(req, function(err) {
        if (err) {
            console.log(err);
            var vm = {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            };
            return res.render('error', vm);
        }
        return res.redirect('/users/manage');
    });

});


module.exports = router;
