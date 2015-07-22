var express = require('express');
var router = express.Router();
var passport = require('passport');

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
    passport.authenticate('local', {
        failureRedirect: '/',
        successRedirect: '/users',
        failureFlash: 'Invalid credentials'
    }));

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});


module.exports = router;
