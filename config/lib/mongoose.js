'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose');

// Load the mongoose models
module.exports.loadModels = function (callback) {
  // Globbing model files
  config.files.server.models.forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });

  if (callback) callback();
};

// Initialize Mongoose
module.exports.connect = function (cb) {
  var _this = this;
  console.log('config.db.uri', config.db.uri);
  console.log('config.db.options', config.db.options);
  
  var db = mongoose.connect(config.db.uri, function (err) {
  //var db = MongoClient.connect(config.db.uri, function(err, mdb) {
    // Log Error
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    } else {

      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug);

      // Call callback FN
      if (cb) cb(db);
    }
  });
//   var db = mongoose.connect(config.db.uri, {
//     server: {
//       socketOptions: {
//         keepAlive: 1
//       }
//     }
//   }).connection;

//   db.on('error', (err) => {
//     console.log(err);
//   });
//   db.once('open', (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       // ...
//     }
//   });
};

module.exports.disconnect = function (cb) {
  mongoose.disconnect(function (err) {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    cb(err);
  });
};
