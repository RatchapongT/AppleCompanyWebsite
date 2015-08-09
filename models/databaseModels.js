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
    percentMalay: {
        type_B_Discount: Number,
        type_B_Discount_Pay1: Number,
        type_B_Discount_Pay2: Number,
        type_B_Discount_Pay3: Number,
        type_B_Discount_Pay4: Number,
        type_B_Discount_Pay5: Number,

        type_S_Discount: Number,
        type_S_Discount_Pay1: Number,
        type_S_Discount_Pay2: Number,
        type_S_Discount_Pay3: Number,

        type_ABC1_Discount: Number,
        type_ABC1_Discount_Pay: Number,

        type_3ABC_Discount: Number,
        type_3ABC_Discount_Pay: Number,

        type_3N_Discount: Number,
        type_3N_Discount_Pay: Number,

        type_2ABC_Discount: Number,
        type_2ABC_Discount_Pay: Number,

        type_2N_Discount: Number,
        type_2N_Discount_Pay: Number,

        type_FLOAT_Discount: Number,
        type_FLOAT_Discount_Pay: Number,

        type_DIGIT_Discount: Number,
        type_DIGIT_Discount_Pay: Number
    },
    percentThai: {
        type_3B_Discount: Number,
        type_3B_Discount_Pay: Number,

        type_3T_Discount: Number,
        type_3T_Discount_Pay: Number,

        type_3L_Discount: Number,
        type_3L_Discount_Pay: Number,

        type_2BL_Discount: Number,
        type_2BL_Discount_Pay: Number,

        type_1B_Discount: Number,
        type_1B_Discount_Pay: Number,

        type_1L_Discount: Number,
        type_1L_Discount_Pay: Number,

        type_1BL123_Discount: Number,
        type_1BL123_Discount_Pay: Number,

        type_4T_Discount: Number,
        type_4T_Discount_Pay: Number,

        type_5T_Discount: Number,
        type_5T_Discount_Pay: Number,

        type_2T_Discount: Number,
        type_2T_Discount_Pay: Number
    },
    paymentCondition: String,
    malay: {type: Boolean, default: false},
    thai: {type: Boolean, default: false},
    _workerDetail: {type: Schema.Types.ObjectId, ref: 'Worker'},
    created: {type: Date, default: Date.now}
});

partnerSchema.path('partnerID').validate(function (partnerID, next) {
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
    percentMalay: {
        type_B_Discount: Number,
        type_B_Discount_Pay1: Number,
        type_B_Discount_Pay2: Number,
        type_B_Discount_Pay3: Number,
        type_B_Discount_Pay4: Number,
        type_B_Discount_Pay5: Number,

        type_S_Discount: Number,
        type_S_Discount_Pay1: Number,
        type_S_Discount_Pay2: Number,
        type_S_Discount_Pay3: Number,

        type_ABC1_Discount: Number,
        type_ABC1_Discount_Pay: Number,

        type_3ABC_Discount: Number,
        type_3ABC_Discount_Pay: Number,

        type_3N_Discount: Number,
        type_3N_Discount_Pay: Number,

        type_2ABC_Discount: Number,
        type_2ABC_Discount_Pay: Number,

        type_2N_Discount: Number,
        type_2N_Discount_Pay: Number,

        type_FLOAT_Discount: Number,
        type_FLOAT_Discount_Pay: Number,

        type_DIGIT_Discount: Number,
        type_DIGIT_Discount_Pay: Number
    },
    percentThai: {
        type_3B_Discount: Number,
        type_3B_Discount_Pay: Number,

        type_3T_Discount: Number,
        type_3T_Discount_Pay: Number,

        type_3L_Discount: Number,
        type_3L_Discount_Pay: Number,

        type_2BL_Discount: Number,
        type_2BL_Discount_Pay: Number,

        type_1B_Discount: Number,
        type_1B_Discount_Pay: Number,

        type_1L_Discount: Number,
        type_1L_Discount_Pay: Number,

        type_1BL123_Discount: Number,
        type_1BL123_Discount_Pay: Number,

        type_4T_Discount: Number,
        type_4T_Discount_Pay: Number,

        type_5T_Discount: Number,
        type_5T_Discount_Pay: Number,

        type_2T_Discount: Number,
        type_2T_Discount_Pay: Number
    },
    paymentCondition: String,
    malay: {type: Boolean, default: false},
    thai: {type: Boolean, default: false},
    _workerDetail: {type: Schema.Types.ObjectId, ref: 'Worker'},
    created: {type: Date, default: Date.now}
});

customerSchema.post('save', function (next) {
    Customer.update()
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
    _ownerDetail: {type: Schema.Types.ObjectId},
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
    reportedUsername: String,
    reportedUserNickname: String,
    user_id: String,
    userID: String,
    userNickname: String,
    payIn: {type: Number, Default: 0},
    paymentMethodBankName: String,
    paymentMethodBankNumber: Number,
    paymentMethodBankType: String,
    created: {type: Date, default: Date.now}
});

var payOutSchema = new Schema({
    reportedUsername: String,
    reportedUserNickname: String,
    user_id: String,
    bank:[bankSchema],
    otherBank: {
        bankNumber: Number,
        bankName: String,
        bankType: String
    },
    userID: String,
    userNickname: String,
    payOut: {type: Number, Default: 0},
    paymentMethodBankID: String,
    paymentMethodBankName: String,
    paymentMethodBankNumber: Number,
    paymentMethodBankType: String,
    approved: {type: Boolean, default: false},
    created: {type: Date, default: Date.now}
});

var buySchema = new Schema({
    partner_id: String,
    partnerID: String,
    partnerNickname: String,
    win: {type: Number, Default: 0},
    buy: {type: Number, Default: 0},
    balance: {type: Number, Default: 0}
});

var sellSchema = new Schema({
    customer_id: String,
    customerID: String,
    customerNickname: String,
    strike: {type: Number, Default: 0},
    sale: {type: Number, Default: 0},
    balance: {type: Number, Default: 0}
});

var recordPageSchema = new Schema({
    recordDate: Date,
    recordType: String,
    hierarchy: Object,
    payInPage: {
        locked: {type: Boolean, default: false},
        payInDetails: [payInSchema]
    },
    payOutPage: {
        locked: {type: Boolean, default: false},
        payOutDetails: [payOutSchema]
    },

    profitLossPage: {
        locked: {type: Boolean, default: false},
        buyDetails: [buySchema],
        sellDetails: [sellSchema]
    },
    totalWin: {type: Number, default: 0},
    totalBuy: {type: Number, default: 0},
    totalSale: {type: Number, default: 0},
    totalStrike: {type: Number, default: 0},
    totalBalance: {type: Number, default: 0},
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
    WorkerPartner: WorkerPartner,
    RecordPage: RecordPage,
    Entry: Entry,
    SystemBank: SystemBank
};