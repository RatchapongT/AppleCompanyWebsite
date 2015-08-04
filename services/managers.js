var Manager = require('../models/databaseModels').Manager;
var Worker = require('../models/databaseModels').Worker;
var ManagerWorker = require('../models/databaseModels').ManagerWorker;

exports.getUnownedWorkerList = function (input, next) {
    Worker.find({_managerDetail: null}).deepPopulate(['_profileDetail', '_profileDetail._userDetail']).exec(function (err, object) {
        if (err) throw err;
        next(err, object);

    });
};
exports.getManagerList = function (input, next) {
    Manager.find().deepPopulate(['_profileDetail', '_profileDetail._userDetail']).exec(function (err, object) {
        if (err) throw err;
        next(err, object);
    });
};
exports.getManagerWorkerRelationship = function (input, next) {
    ManagerWorker.find().deepPopulate(['_customerDetail',
        '_workerDetail',
        '_workerDetail._profileDetail',
        '_workerDetail._profileDetail._userDetail',
        '_managerDetail',
        '_managerDetail._profileDetail',
        '_managerDetail._profileDetail._userDetail']).exec(function (err, object) {
        if (err) throw err;
        next(err, object);
    });
};
exports.assignWorker = function (input, next) {
    Worker.findByIdAndUpdate(input.workerID, {
        $set: {
            _managerDetail: input.requestManagerID,
        }
    }, function (err, object) {
        if (err) throw err;
        var newManagerWorker = new ManagerWorker({
            _managerDetail: input.requestManagerID,
            _workerDetail: input.workerID
        });

        newManagerWorker.save(function (err) {
            if (err) {
                return next(err);
            }
            next(err, object);
        });
    });
};
exports.deleteManagerWorkerRelationship = function (input, next) {
    Worker.findByIdAndUpdate(input.workerID, {
        $unset: {
            _managerDetail: 1,
        }
    }, function (err, object) {
        if (err) throw err;
        ManagerWorker.remove({_workerDetail: input.workerID}).exec();
        next(err, object);
    });
};



