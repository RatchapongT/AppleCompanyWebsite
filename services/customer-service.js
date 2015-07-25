var User = require('../models/customer').Customer;

exports.addCustomer = function (customer, next) {
    var newCustomer = new Customer({
        customerID: customer.customerID,
        firstName: customer.firstName,
        lastName: customer.lastName,
        address: customer.address,
        paymentMethod: customer.paymentMethod
    });

    newCustomer.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });


};

exports.findCustomer = function (customer, next) {
    User.findOne({customerID: customer}, function (err, user) {
        next(err, user);
    });
};

