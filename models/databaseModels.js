var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate');

var userSchema = new Schema({
    username: String,
    password: String,
    created: {type: Date, default: Date.now}
});

userSchema.path('username').validate(function (username, next) {
    User.findOne({username : username}, function (err, user) {
        if (err) {
            return next(false);
        }
        if (!user) {
            return next(true); //Valid
        } else {
            return next(false);
        }
    });
}, 'Username Already Exists');

userSchema.pre('remove', function (next) {
    var userID = this._id
    UserDetail.findOne({_userDetail: this._id}, function (err, userObject) {
        if (userObject.accountType == "Worker") {
            Worker.findOne({_profileDetail: userObject._id}, function (err, workerObject) {
                Customer.update({_workerDetail: workerObject._id}, {$unset: {_workerDetail: 1}}, {multi: true},
                    function (err, result) {
                        if (err) throw err;
                        UserDetail.remove({_userDetail: userID}).exec();
                        Worker.remove({_profileDetail: userObject._id}).exec();
                        WorkerCustomer.remove({_workerDetail: workerObject._id}).exec();
                        next();
                    });
                Partner.update({_workerDetail: workerObject._id}, {$unset: {_workerDetail: 1}}, {multi: true},
                    function (err, result) {
                        if (err) throw err;
                        UserDetail.remove({_userDetail: userID}).exec();
                        Worker.remove({_profileDetail: userObject._id}).exec();
                        WorkerPartner.remove({_workerDetail: workerObject._id}).exec();
                        next();
                    });
            });
        } else if (userObject.accountType == "Manager") {
            Manager.findOne({_profileDetail: userObject._id}, function (err, managerObject) {
                Worker.update({_managerDetail: managerObject._id}, {$unset: {_managerDetail: 1}}, {multi: true},
                    function (err, result) {
                        if (err) throw err;
                        UserDetail.remove({_userDetail: userID}).exec();
                        Manager.remove({_profileDetail: userObject._id}).exec();
                        ManagerWorker.remove({_managerDetail: managerObject._id}).exec();
                        next();
                    });
            });
            next();
        } else {
            UserDetail.remove({_userDetail: userID}).exec();
            next();
        }
    });
});

var userDetailSchema = new Schema({
    accountType: String,
    nickname: String,
    phone: String,
    lineID: String,
    _userDetail: {type: Schema.Types.ObjectId, ref: 'User'},
    created: {type: Date, default: Date.now}
});


var managerSchema = new Schema({
    _profileDetail: {type: Schema.Types.ObjectId, ref: 'UserDetail'},
    created: {type: Date, default: Date.now}
});

var workerSchema = new Schema({
    _profileDetail: {type: Schema.Types.ObjectId, ref: 'UserDetail'},
    _managerDetail: {type: Schema.Types.ObjectId, ref: 'Manager'},
    created: {type: Date, default: Date.now}
});

var partnerSchema = new Schema({
    partnerID: String,
    nickname: String,
    lineID: String,
    phone: String,
    percentThai: {
        type_B_Discount: {type: Number, Default: 0},
        type_B_Discount_Pay1: {type: Number, Default: 0},
        type_B_Discount_Pay2: {type: Number, Default: 0},
        type_B_Discount_Pay3: {type: Number, Default: 0},
        type_B_Discount_Pay4: {type: Number, Default: 0},
        type_B_Discount_Pay5: {type: Number, Default: 0},

        type_S_Discount: {type: Number, Default: 0},
        type_S_Discount_Pay1: {type: Number, Default: 0},
        type_S_Discount_Pay2: {type: Number, Default: 0},
        type_S_Discount_Pay3: {type: Number, Default: 0},

        type_ABC1_Discount: {type: Number, Default: 0},
        type_ABC1_Discount_Pay: {type: Number, Default: 0},

        type_3ABC_Discount: {type: Number, Default: 0},
        type_3ABC_Discount_Pay: {type: Number, Default: 0},

        type_3N_Discount: {type: Number, Default: 0},
        type_3N_Discount_Pay: {type: Number, Default: 0},

        type_2ABC_Discount: {type: Number, Default: 0},
        type_2ABC_Discount_Pay: {type: Number, Default: 0},

        type_2N_Discount: {type: Number, Default: 0},
        type_2N_Discount_Pay: {type: Number, Default: 0},

        type_FLOAT_Discount: {type: Number, Default: 0},
        type_FLOAT_Discount_Pay: {type: Number, Default: 0},

        type_DIGIT_Discount: {type: Number, Default: 0},
        type_DIGIT_Discount_Pay: {type: Number, Default: 0}
    },
    percentMalay: {
        type_3B_Discount: {type: Number, Default: 0},
        type_3B_Discount_Pay: {type: Number, Default: 0},

        type_3T_Discount: {type: Number, Default: 0},
        type_3T_Discount_Pay: {type: Number, Default: 0},

        type_3L_Discount: {type: Number, Default: 0},
        type_3L_Discount_Pay: {type: Number, Default: 0},

        type_3BL_Discount: {type: Number, Default: 0},
        type_3BL_Discount_Pay: {type: Number, Default: 0},

        type_1B_Discount: {type: Number, Default: 0},
        type_1B_Discount_Pay: {type: Number, Default: 0},

        type_1L_Discount: {type: Number, Default: 0},
        type_1L_Discount_Pay: {type: Number, Default: 0},

        type_1BL123_Discount: {type: Number, Default: 0},
        type_1BL123_Discount_Pay: {type: Number, Default: 0},

        type_4T_Discount: {type: Number, Default: 0},
        type_4T_Discount_Pay: {type: Number, Default: 0},

        type_5T_Discount: {type: Number, Default: 0},
        type_5T_Discount_Pay: {type: Number, Default: 0},

        type_2T_Discount: {type: Number, Default: 0},
        type_2T_Discount_Pay: {type: Number, Default: 0}
    },
    paymentCondition: String,
    malay: {type: Boolean, default: false},
    thai: {type: Boolean, default: false},
    _workerDetail: {type: Schema.Types.ObjectId, ref: 'Worker'},
    created: {type: Date, default: Date.now}
});

partnerSchema.path('partnerID').validate(function (customerID, next) {
    Partner.findOne({partnerID: partnerID}, function (err, user) {
        if (err) {
            return next(false);
        }

        if (!user) {
            return next(true);
        } else {
            return next(false);
        }
    });
}, 'Partner ID Already Exists');

partnerSchema.pre('remove', function (next) {
    Bank.remove({_ownerDetail: this._id}).exec();
    WorkerPartner.remove({_partnerDetail: this._id}).exec();
    next();
});

var customerSchema = new Schema({
    customerID: String,
    nickname: String,
    lineID: String,
    phone: String,
    percentThai: {
        type_B_Discount: {type: Number, Default: 0},
        type_B_Discount_Pay1: {type: Number, Default: 0},
        type_B_Discount_Pay2: {type: Number, Default: 0},
        type_B_Discount_Pay3: {type: Number, Default: 0},
        type_B_Discount_Pay4: {type: Number, Default: 0},
        type_B_Discount_Pay5: {type: Number, Default: 0},

        type_S_Discount: {type: Number, Default: 0},
        type_S_Discount_Pay1: {type: Number, Default: 0},
        type_S_Discount_Pay2: {type: Number, Default: 0},
        type_S_Discount_Pay3: {type: Number, Default: 0},

        type_ABC1_Discount: {type: Number, Default: 0},
        type_ABC1_Discount_Pay: {type: Number, Default: 0},

        type_3ABC_Discount: {type: Number, Default: 0},
        type_3ABC_Discount_Pay: {type: Number, Default: 0},

        type_3N_Discount: {type: Number, Default: 0},
        type_3N_Discount_Pay: {type: Number, Default: 0},

        type_2ABC_Discount: {type: Number, Default: 0},
        type_2ABC_Discount_Pay: {type: Number, Default: 0},

        type_2N_Discount: {type: Number, Default: 0},
        type_2N_Discount_Pay: {type: Number, Default: 0},

        type_FLOAT_Discount: {type: Number, Default: 0},
        type_FLOAT_Discount_Pay: {type: Number, Default: 0},

        type_DIGIT_Discount: {type: Number, Default: 0},
        type_DIGIT_Discount_Pay: {type: Number, Default: 0}
    },
    percentMalay: {
        type_3B_Discount: {type: Number, Default: 0},
        type_3B_Discount_Pay: {type: Number, Default: 0},

        type_3T_Discount: {type: Number, Default: 0},
        type_3T_Discount_Pay: {type: Number, Default: 0},

        type_3L_Discount: {type: Number, Default: 0},
        type_3L_Discount_Pay: {type: Number, Default: 0},

        type_3BL_Discount: {type: Number, Default: 0},
        type_3BL_Discount_Pay: {type: Number, Default: 0},

        type_1B_Discount: {type: Number, Default: 0},
        type_1B_Discount_Pay: {type: Number, Default: 0},

        type_1L_Discount: {type: Number, Default: 0},
        type_1L_Discount_Pay: {type: Number, Default: 0},

        type_1BL123_Discount: {type: Number, Default: 0},
        type_1BL123_Discount_Pay: {type: Number, Default: 0},

        type_4T_Discount: {type: Number, Default: 0},
        type_4T_Discount_Pay: {type: Number, Default: 0},

        type_5T_Discount: {type: Number, Default: 0},
        type_5T_Discount_Pay: {type: Number, Default: 0},

        type_2T_Discount: {type: Number, Default: 0},
        type_2T_Discount_Pay: {type: Number, Default: 0}
    },
    paymentCondition: String,
    malay: {type: Boolean, default: false},
    thai: {type: Boolean, default: false},
    _workerDetail: {type: Schema.Types.ObjectId, ref: 'Worker'},
    created: {type: Date, default: Date.now}
});

customerSchema.path('customerID').validate(function (customerID, next) {
    Customer.findOne({customerID: customerID}, function (err, user) {
        if (err) {
            return next(false);
        }

        if (!user) {
            return next(true);
        } else {
            return next(false);
        }
    });
}, 'Customer ID Already Exists');

customerSchema.pre('remove', function (next) {
    Bank.remove({_ownerDetail: this._id}).exec();
    WorkerCustomer.remove({_customerDetail: this._id}).exec();
    next();
});

var bankSchema = new Schema({
    bankNumber: String,
    bankName: String,
    bankType: String,
    _ownerDetail: {type: Schema.Types.ObjectId, ref: 'Customer'},
    created: {type: Date, default: Date.now}
});

var systemBankSchema = new Schema({
    bankNumber: String,
    bankName: String,
    bankType: String,
    created: {type: Date, default: Date.now}
});

var managerWorkerSchema = new Schema({
    _workerDetail: {type: Schema.Types.ObjectId, ref: 'Worker'},
    _managerDetail: {type: Schema.Types.ObjectId, ref: 'Manager'},
    created: {type: Date, default: Date.now}
});

var workerCustomerSchema = new Schema({
    _customerDetail: {type: Schema.Types.ObjectId, ref: 'Customer'},
    _workerDetail: {type: Schema.Types.ObjectId, ref: 'Worker'},
    created: {type: Date, default: Date.now}
});

var workerPartnerSchema = new Schema({
    _partnerDetail: {type: Schema.Types.ObjectId, ref: 'Partner'},
    _workerDetail: {type: Schema.Types.ObjectId, ref: 'Worker'},
    created: {type: Date, default: Date.now}
});

var payInSchema = new Schema({
    reportedUserID: String,
    reportedUsername: String,
    reportedUserNickname: String,
    payIn: {type: Number, Default: 0},
    paymentMethod_id: String,
    paymentMethodBankName: String,
    paymentMethodBankNumber: Number,
    paymentMethodBankType: String,
    created: {type: Date, default: Date.now}
});

var payOutSchema = new Schema({
    reportedUserID: String,
    reportedUsername: String,
    reportedUserNickname: String,
    payOut: {type: Number, Default: 0},
    paymentMethod_id: String,
    paymentMethodBankName: String,
    paymentMethodBankNumber: Number,
    paymentMethodBankType: String,
    approved: {type: Boolean, default: false},
    created: {type: Date, default: Date.now}
});

var buySchema = new Schema({
    strike: {type: Number, Default: 0},
    sale: {type: Number, Default: 0},
    manager_id: String,
    managerUsername: String,
    managerNickname: String,
    customer_id: String,
    customerID: String,
    customerNickname: String,
    worker_id: String,
    workerUsername: String,
    workerNickname: String
});

var sellSchema = new Schema({
    strike: {type: Number, Default: 0},
    sale: {type: Number, Default: 0},
    manager_id: String,
    managerUsername: String,
    managerNickname: String,
    partner_id: String,
    partnerID: String,
    partnerNickname: String,
    worker_id: String,
    workerUsername: String,
    workerNickname: String
});

var recordPageSchema = new Schema({
    recordDate: Date,
    recordType: String,
    payInPage: {
        locked: {type: Boolean, default: false},
        payInDetails: [payInSchema]
    },
    payOutPage: {
        locked: {type: Boolean, default: false},
        payInDetails: [payOutSchema]
    },
    sellPage: {
        locked: {type: Boolean, default: false},
        sellDetails: [sellSchema]
    },
    buyPage: {
        locked: {type: Boolean, default: false},
        buyDetails: [buySchema]
    },
    totalSellSale: {type: Number, default: 0},
    totalSellStrike: {type: Number, default: 0},
    totalBuySale: {type: Number, default: 0},
    totalBuyStrike: {type: Number, default: 0},
    created: {type: Date, default: Date.now}
});

var entrySchema = new Schema({
    _recordDetail: {type: Schema.Types.ObjectId, ref: 'RecordPage'},
    recordDate: Date,
    manager_id: String,
    managerUsername: String,
    managerNickname: String,
    customer_id: String,
    customerID: String,
    customerNickname: String,
    worker_id: String,
    workerUsername: String,
    workerNickname: String,
    strike: {type: Number, Default: 0},
    sale: {type: Number, Default: 0},
    balance: {type: Number, Default: 0},
    payInDetails: [payInSchema],
    payOutDetails: [payOutSchema],
    customerType: String,
    created: {type: Date, default: Date.now}
});



var User = mongoose.model('User', userSchema);
var UserDetail = mongoose.model('UserDetail', userDetailSchema);
var Manager = mongoose.model('Manager', managerSchema);
var Worker = mongoose.model('Worker', workerSchema);
var Customer = mongoose.model('Customer', customerSchema);
var Partner = mongoose.model('Partner', partnerSchema);
var Bank = mongoose.model('Bank', bankSchema);
var ManagerWorker = mongoose.model('ManagerWorker', managerWorkerSchema);
var WorkerPartner = mongoose.model('WorkerPartner', workerPartnerSchema);
var WorkerCustomer = mongoose.model('WorkerCustomer', workerCustomerSchema);
var RecordPage = mongoose.model('RecordPage', recordPageSchema);
var Entry = mongoose.model('Entry', entrySchema);
var SystemBank = mongoose.model('SystemBank', systemBankSchema);

workerSchema.plugin(deepPopulate, {});
managerSchema.plugin(deepPopulate, {});
customerSchema.plugin(deepPopulate, {});
workerCustomerSchema.plugin(deepPopulate, {});
workerPartnerSchema.plugin(deepPopulate, {});
managerWorkerSchema.plugin(deepPopulate, {});
partnerSchema.plugin(deepPopulate, {});
entrySchema.plugin(deepPopulate, {});

module.exports = {
    User: User,
    Customer: Customer,
    Bank: Bank,
    UserDetail: UserDetail,
    Manager: Manager,
    Worker: Worker,
    Partner: Partner,
    ManagerWorker: ManagerWorker,
    WorkerCustomer: WorkerCustomer,
    RecordPage: RecordPage,
    Entry: Entry,
    SystemBank: SystemBank
};