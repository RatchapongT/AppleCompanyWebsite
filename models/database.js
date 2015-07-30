var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var databaseService = require('../services/database-service');

var userSchema = new Schema({
    username: String,
    password: String,
    accountType: String,
    nickname: String,
    phone: String,
    lineID: String,
    responsibleWorker: [String],
    responsibleCustomer: [String],
    manager: String,
    haveManager: {type: Boolean, default: false},
    created: {type: Date, default: Date.now}
});

var entrySchema = new Schema({
    recordDate: Date,
    customerID: String,
    sale: Number,
    strike: Number,
    created: {type: Date, default: Date.now}
});

var recordSchema = new Schema({
    recordDate: Date,
    locked: {type: Boolean, default: false},
    created: {type: Date, default: Date.now}
});


var relationshipSchema = new Schema({
    customerID: String,
    username: String,
    manager: String,
    created: {type: Date, default: Date.now}
});


userSchema.path('username').validate(function (value, next) {

    databaseService.findUser(value, function (err, user) {
        if (err) {
            console.log(err);
            return next(false);
        }
        console.log(!user);
        next(!user);
    });
}, 'That username is already in use');

var bankSchema = new Schema({
    bankNumber: String,
    bankName: String,
    bankType: String,
    created: {type: Date, default: Date.now}
});

var customerSchema = new Schema({
    customerID: String,
    haveOwner: {type: Boolean, default: false},
    responsibleWorker: String,
    nickname: String,
    lineID: String,
    phone: String,
    percent: Number,
    paymentCondition: String,
    malay: {type: Boolean, default: false},
    thai: {type: Boolean, default: false},
    bank: [bankSchema],
    created: {type: Date, default: Date.now}

});


customerSchema.path('customerID').validate(function (value, next) {
    databaseService.findCustomer(value, function (err, customer) {
        if (err) {
            console.log(err);
            return next(false);
        }
        console.log(!customer);
        next(!customer);
    });
}, 'That customer ID already in use');


var User = mongoose.model('User', userSchema);
var Customer = mongoose.model('Customer', customerSchema);
var Bank = mongoose.model('Bank', bankSchema);
var Relationship = mongoose.model('Relationship', relationshipSchema);
var Record = mongoose.model('Record', recordSchema);
var Entry = mongoose.model('Entry', entrySchema);

module.exports = {
    User: User,
    Customer: Customer,
    Bank: Bank,
    Relationship: Relationship,
    Record: Record,
    Entry: Entry
};