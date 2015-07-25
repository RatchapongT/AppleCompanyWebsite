var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var customerService = require('../services/customer-service');

var customerSchema = new Schema({
    customerID: String,
    firstName: String,
    lastName: String,
    address: String,
    paymentMethod: String,
    created: {type: Date, default: Date.now}
});

customerSchema.path('customerID').validate(function(value, next) {
    customerService.findCustomer(value, function(err, cusID) {
        if (err) {
            console.log(err);
            return next(false);
        }
        console.log(!cusID);
        next(!cusID);
    });
}, 'That customer ID already in use');

var Customer = mongoose.model('Customer', customerSchema);

module.exports = {
    Customer: Customer
};