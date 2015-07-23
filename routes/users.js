var express = require('express');
var router = express.Router();
var passport = require('passport');
var userService = require('../services/user-service');
var User = require('../models/user').User;


/* GET users listing. */
router.get('/', function(req, res, next) {
  var vm = {
    title: 'Homepage'
  };
  res.render('homepage', vm);
});

router.get('/create', function(req, res, next) {
  var vm = {
    title: 'Create an account'
  };
  res.render('users/create', vm);
});

router.post('/create', function(req, res, next) {
  userService.addUser(req.body, function(err) {
    if (err) {
      console.log(err);
      var vm = {
        title: 'Create an account',
        input: req.body,
        error: err
      };
      delete vm.input.password;
      return res.render('users/create', vm);
    }
    req.login(req.body, function(err) {
      res.redirect('/index');
    });
  });
});

router.get('/manage', function(req, res, next) {
  User.find({}, 'username', function(err, users) {
    if (err) throw err;

    res.render('manage', {data: users});
  });

});

router.get('/manage', function(req, res, next) {
  User.find({}, 'username', function(err, users) {
    if (err) throw err;

    res.render('manage', {data: users});
  });

});

router.get('/delete/:username', function(req, res) {
  User.remove({
    username: req.params.username
  }, function(err, user) {
    if (err)
      res.send(err);

    res.json({ message: 'Successfully deleted' });
  });
});


module.exports = router;
