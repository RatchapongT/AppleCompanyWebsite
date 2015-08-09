var Customer = require('../models/databaseModels').Customer;
var Bank = require('../models/databaseModels').Bank;
var Worker = require('../models/databaseModels').Worker;

exports.getCustomerList = function (input, next) {
    Customer.find().deepPopulate(['_workerDetail', '_workerDetail._profileDetail', '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
        next(err, object);
    });
};

exports.getCustomerListLimited = function (input, next) {
    Customer.find({_workerDetail: input}).deepPopulate(['_workerDetail', '_workerDetail._profileDetail', '_workerDetail._profileDetail._userDetail']).exec(function (err, object) {
        next(err, object);
    });
};

exports.addCustomer = function (input, next) {
    if (input.nickname == '') {
        input.nickname = 'No Name';
    }
    if (input.phone == '') {
        input.phone = '0000000000';
    }
    if (input.lineID == '') {
        input.lineID = 'No LineID';
    }
    if (input.percent == '') {
        input.percent = 0;
    }
    var newCustomer = new Customer({
        customerID: input.customerID,
        nickname: input.nickname,
        phone: input.phone,
        paymentCondition: input.paymentCondition,
        thai: input.thai,
        malay: input.malay,
        lineID: input.lineID,
        percentMalay: {
            type_B_Discount: 0,
            type_B_Discount_Pay1: 0,
            type_B_Discount_Pay2: 0,
            type_B_Discount_Pay3: 0,
            type_B_Discount_Pay4: 0,
            type_B_Discount_Pay5: 0,

            type_S_Discount: 0,
            type_S_Discount_Pay1: 0,
            type_S_Discount_Pay2: 0,
            type_S_Discount_Pay3: 0,

            type_ABC1_Discount: 0,
            type_ABC1_Discount_Pay: 0,

            type_3ABC_Discount: 0,
            type_3ABC_Discount_Pay: 0,

            type_3N_Discount: 0,
            type_3N_Discount_Pay: 0,

            type_2ABC_Discount: 0,
            type_2ABC_Discount_Pay: 0,

            type_2N_Discount: 0,
            type_2N_Discount_Pay: 0,

            type_FLOAT_Discount: 0,
            type_FLOAT_Discount_Pay: 0,

            type_DIGIT_Discount: 0,
            type_DIGIT_Discount_Pay: 0
        },
        percentThai: {
            type_3B_Discount: 0,
            type_3B_Discount_Pay: 0,

            type_3T_Discount: 0,
            type_3T_Discount_Pay: 0,

            type_3L_Discount: 0,
            type_3L_Discount_Pay: 0,

            type_2BL_Discount: 0,
            type_2BL_Discount_Pay: 0,

            type_1B_Discount: 0,
            type_1B_Discount_Pay: 0,

            type_1L_Discount: 0,
            type_1L_Discount_Pay: 0,

            type_1BL123_Discount: 0,
            type_1BL123_Discount_Pay: 0,

            type_4T_Discount: 0,
            type_4T_Discount_Pay: 0,

            type_5T_Discount: 0,
            type_5T_Discount_Pay: 0,

            type_2T_Discount: 0,
            type_2T_Discount_Pay: 0
        }
    });

    newCustomer.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};
exports.deleteCustomer = function (input, res, next) {
    Customer.findById(input, function (err, object) {
        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};
exports.getBankList = function (input, next) {
    Bank.find({_ownerDetail: input}).populate('_ownerDetail').exec(function (err, object) {
        next(err, object);
    });
};


exports.addBank = function (input, next) {
    var newBank = new Bank({
        _ownerDetail: input.customerID,
        bankNumber: input.bankNumber,
        bankName: input.bankName,
        bankType: input.bankType
    });

    newBank.save(function (err) {
        if (err) {
            return next(err);
        }
        next(null);
    });
};
exports.deleteBank = function (input, res, next) {
    Bank.findById(input, function (err, object) {
        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};

exports.editCustomerProfiles = function (input, next) {
    console.log(input);

    var option = {
        $set: {
            malay: input.malay ? input.malay : false,
            thai: input.thai ? input.thai : false,
            nickname: input.nickname,
            phone: input.phone,
            lineID: input.lineID,
            paymentCondition: input.paymentCondition,
            percentThai: {
                type_3B_Discount: input.type_3B_Discount ? input.type_3B_Discount : 0,
                type_3B_Discount_Pay: input.type_3B_Discount_Pay ? input.type_3B_Discount_Pay : 0,

                type_3T_Discount: input.type_3T_Discount ? input.type_3T_Discount : 0,
                type_3T_Discount_Pay: input.type_3T_Discount_Pay ? input.type_3T_Discount_Pay : 0,

                type_3L_Discount: input.type_3L_Discount ? input.type_3L_Discount : 0,
                type_3L_Discount_Pay: input.type_3L_Discount_Pay ? input.type_3L_Discount_Pay : 0,

                type_2BL_Discount: input.type_2BL_Discount ? input.type_2BL_Discount : 0,
                type_2BL_Discount_Pay: input.type_2BL_Discount_Pay ? input.type_2BL_Discount_Pay : 0,

                type_1B_Discount: input.type_1B_Discount ? input.type_1B_Discount : 0,
                type_1B_Discount_Pay: input.type_1B_Discount_Pay ? input.type_1B_Discount_Pay : 0,

                type_1L_Discount: input.type_1L_Discount ? input.type_1L_Discount : 0,
                type_1L_Discount_Pay: input.type_1L_Discount_Pay ? input.type_1L_Discount_Pay : 0,

                type_1BL123_Discount: input.type_1BL123_Discount ? input.type_1BL123_Discount : 0,
                type_1BL123_Discount_Pay: input.type_1BL123_Discount_Pay ? input.type_1BL123_Discount_Pay : 0,

                type_4T_Discount: input.type_4T_Discount ? input.type_4T_Discount : 0,
                type_4T_Discount_Pay: input.type_4T_Discount_Pay ? input.type_4T_Discount_Pay : 0,

                type_5T_Discount: input.type_5T_Discount ? input.type_5T_Discount : 0,
                type_5T_Discount_Pay: input.type_5T_Discount_Pay ? input.type_5T_Discount_Pay : 0,

                type_2T_Discount: input.type_2T_Discount ? input.type_2T_Discount : 0,
                type_2T_Discount_Pay: input.type_2T_Discount_Pay ? input.type_2T_Discount_Pay : 0
            },
            percentMalay: {
                type_B_Discount: input.type_B_Discount ? input.type_B_Discount : 0,
                type_B_Discount_Pay1: input.type_B_Discount_Pay1 ? input.type_B_Discount_Pay1 : 0,
                type_B_Discount_Pay2: input.type_B_Discount_Pay2 ? input.type_B_Discount_Pay2 : 0,
                type_B_Discount_Pay3: input.type_B_Discount_Pay3 ? input.type_B_Discount_Pay3 : 0,
                type_B_Discount_Pay4: input.type_B_Discount_Pay4 ? input.type_B_Discount_Pay4 : 0,
                type_B_Discount_Pay5: input.type_B_Discount_Pay5 ? input.type_B_Discount_Pay5 : 0,

                type_S_Discount: input.type_S_Discount ? input.type_S_Discount : 0,
                type_S_Discount_Pay1: input.type_S_Discount_Pay1 ? input.type_S_Discount_Pay1 : 0,
                type_S_Discount_Pay2: input.type_S_Discount_Pay2 ? input.type_S_Discount_Pay2 : 0,
                type_S_Discount_Pay3: input.type_S_Discount_Pay3 ? input.type_S_Discount_Pay3 : 0,

                type_ABC1_Discount: input.type_ABC1_Discount ? input.type_ABC1_Discount : 0,
                type_ABC1_Discount_Pay: input.type_ABC1_Discount_Pay ? input.type_ABC1_Discount_Pay : 0,

                type_3ABC_Discount: input.type_3ABC_Discount ? input.type_3ABC_Discount : 0,
                type_3ABC_Discount_Pay: input.type_3ABC_Discount_Pay ? input.type_3ABC_Discount_Pay : 0,

                type_3N_Discount: input.type_3N_Discount ? input.type_3N_Discount : 0,
                type_3N_Discount_Pay: input.type_3N_Discount_Pay ? input.type_3N_Discount_Pay : 0,

                type_2ABC_Discount: input.type_2ABC_Discount ? input.type_2ABC_Discount : 0,
                type_2ABC_Discount_Pay: input.type_2ABC_Discount_Pay ? input.type_2ABC_Discount_Pay : 0,

                type_2N_Discount: input.type_2N_Discount ? input.type_2N_Discount : 0,
                type_2N_Discount_Pay: input.type_2N_Discount_Pay ? input.type_2N_Discount_Pay : 0,

                type_FLOAT_Discount: input.type_FLOAT_Discount ? input.type_FLOAT_Discount : 0,
                type_FLOAT_Discount_Pay: input.type_FLOAT_Discount_Pay ? input.type_FLOAT_Discount_Pay : 0,

                type_DIGIT_Discount: input.type_DIGIT_Discount ? input.type_DIGIT_Discount : 0,
                type_DIGIT_Discount_Pay: input.type_DIGIT_Discount_Pay ? input.type_DIGIT_Discount_Pay : 0
            }
        }
    }

    Customer.findByIdAndUpdate(input.editCustomerID, option, function (err, object) {
        if (err) throw err;
        next(err, object);
    });
};

exports.findCustomer = function (input, next) {
    Customer.findOne({customerID: input}, function (err, user) {
        next(err, user);
    });
};