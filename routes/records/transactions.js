var express = require('express');
var router = express.Router();
var databaseFunction = require('../../services/records');
var underscore = require('underscore');

function ParseToday() {
    var today = new Date();
    if (today.getMonth() + 1 < 10) {
        if (today.getDate() < 10) {
            return new Date(today.getFullYear() + '-0' + (today.getMonth() + 1) + '-0' + today.getDate());
        } else {
            return new Date(today.getFullYear() + '-0' + (today.getMonth() + 1) + '-' + today.getDate());
        }

    } else {
        if (today.getDate() < 10) {
            return new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-0' + today.getDate());
        } else {
            return new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate());
        }
    }
}

router.get('/', function (req, res) {
    res.render('homepage', {
        title: 'Homepage',
        currentUser: req.session.passport.user.username
    });
});

router.get('/view', function (req, res) {
    databaseFunction.getAllRecord(req, function(err, recordObject) {
       console.log(recordObject);
    });
});



module.exports = router;
