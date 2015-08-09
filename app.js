var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Database
var mongoose = require('mongoose');
var passport = require('passport');
var expressSession = require('express-session');
var connectMongo = require('connect-mongo');
var flash = require('connect-flash');
var config = require('./config');



var routes = require('./routes/index');
var users = require('./routes/users');
var customers = require('./routes/customers');
var transactions = require('./routes/transactions');
var partners = require('./routes/partners');
var managers = require('./routes/managers');
var profitLoss = require('./routes/records/profitloss');
var approve = require('./routes/records/approve');
var payin = require('./routes/records/payin');
var payout = require('./routes/records/payout');
var records = require('./routes/records/records');
var centralsheet = require('./routes/records/centralsheet');
var restrict = require('./auth/restrict');

var MongoStore = connectMongo(expressSession);
var passportConfig = require('./auth/passport-config');
passportConfig();

mongoose.connect(config.mongoUri);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(expressSession(
    {
      secret: 'getting good money',
      saveUninitialized: false,
      resave: false,
      store: new MongoStore({
        mongooseConnection: mongoose.connection
      })
    }
));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use(restrict);
app.use('/users', users);
app.use('/managers', managers);
app.use('/customers', customers);
app.use('/partners', partners);
app.use('/profitLoss', profitLoss);
app.use('/approve', approve);
app.use('/payin', payin);
app.use('/payout', payout);
app.use('/centralsheet', centralsheet);
app.use('/transactions', transactions);
app.use('/records', records);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('warning',
        {
          title: 'Warning',
          warningText: "This is embarassing. What are you trying to do? " + "(" + err + ")"
        }
    );
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('warning',
      {
        title: 'Warning',
        warningText: "This is embarassing. What are you trying to do? "  + "(" + err + ")"

      }
  );
});


module.exports = app;
