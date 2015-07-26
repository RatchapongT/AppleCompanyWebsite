var express = require('express');
var router = express.Router();
var databaseService = require('../services/database-service');
var User = require('../models/database').User;


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user
    });
});


router.post('/create', function (req, res, next) {
    databaseService.addUser(req.body, function (err) {
        console.log(req.body);
        if (err) {
            console.log(err);
            req.flash('error', "Username Already Exists");
            return res.redirect('/users/manage');
        }
        req.flash('error', "Successfully Added");
        return res.redirect('/users/manage');
    });
});

router.get('/manage', function (req, res) {
    databaseService.getUserList(req, function (err, object) {
        if (err) {
            console.log(err);
            return res.render('error', {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            });
        }
        return res.render('users/manage', {
            title: 'User Management',
            data: object,
            error: req.flash('error')
        });
    });
});

router.get('/profiles', function (req, res) {
    databaseService.getUserList(req, function (err, object) {
        if (err) {
            console.log(err);
            return res.render('error', {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            });
        }
        User.findOne({username: req.session.passport.user}, 'username created accountType nickname phone lineID', function (err, searchUser) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            return res.render('users/profiles', {
                title: 'User Management',
                data: object,
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchUser: searchUser
            });
        });

    });
});


router.post('/profiles', function (req, res) {
    console.log(req.body);
    databaseService.getUserList(req, function (err, object) {
        if (err) {
            console.log(err);
            return res.render('error', {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            });
        }
        User.findOne({username: req.body.username}, 'username created accountType nickname phone lineID', function (err, searchUser) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            return res.render('users/profiles', {
                title: 'User Management',
                data: object,
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchUser: searchUser
            });
        });

    });
});


router.get('/profiles/:id', function (req, res) {
    databaseService.getUserList(req, function (err, object) {
        if (err) {
            console.log(err);
            return res.render('error', {
                title: 'Error Page',
                message: 'Something went wrong',
                error: err
            });
        }
        User.findOne({_id: req.params.id}, 'username created accountType nickname phone lineID', function (err, searchUser) {
            if (err) {
                console.log(err);
                return res.render('error', {
                    title: 'Error Page',
                    message: 'Something went wrong',
                    error: err
                });
            }
            return res.render('users/profiles', {
                title: 'User Management',
                data: object,
                currentUser: req.session.passport.user,
                error: req.flash('error'),
                searchUser: searchUser
            });
        });

    });
});


router.post('/edit', function (req, res) {

    User.findByIdAndUpdate(req.body.id, {
        $set: {
            lineID: req.body.lineID,
            phone: req.body.phone,
            nickname: req.body.nickname
        }
    }, function (err, object) {
        if (err) return handleError(err);
        req.flash('error', "Successfully edit " + object.username);
        return res.redirect('/users/profiles/' + object.id);
    });
});


router.get('/delete/:id', function (req, res) {
    databaseService.deleteUser(req, function (err) {
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
