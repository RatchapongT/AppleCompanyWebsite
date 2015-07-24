var express = require('express');
var router = express.Router();
var passport = require('passport');
var config = require('../config');

/* GET home page. */
router.get('/', function (req, res, next) {

    if (req.user) {
        return res.redirect('/users');
    }
    var vm = {
        title: 'Login',
        error: req.flash('error')
    };
    res.render('index', vm);

});

router.post('/login',
    function(req, res, next) {
        req.session.cookie.maxAge = config.cookieMaxAge;
        next();
    },
    passport.authenticate('local', {
        failureRedirect: '/',
        successRedirect: '/users',
        failureFlash: 'Invalid credentials'
    }));

router.get('/logout', function (req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});


module.exports = router;
