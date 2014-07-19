var mongoose = require('mongoose');

var config = require('../config');
var logger = require('./logger').logger;
var log_tags = require('./logger').tags;

/*
 * Build the connection string.
 */
var url = 'mongodb://';

if (config.get('database:username')) {
  url += config.get('database:username');

  if (config.get('database:password')) {
    url += ':' + config.get('database:password');
  }

  url += '@';
}
url += config.get('database:host') + '/' + config.get('database:name');

module.exports = {
  connect: function cbOnConnect() {
    // Open DB connection to database.
    mongoose.connect(url, {
      server: {
        auto_reconnect: true,
        socketOptions : {
          keepAlive: 1 // Needed for long running applications. Prevent 'connection closed' errors.
        }
      }
    });

    /*
     * Database checks.
     */
    mongoose.connection.on('error', function cbOnConnectionError(error) {
      logger.error(error, {
        module: 'core',
        tags  : [
          log_tags.init,
          log_tags.db
        ]
      });
    });

    mongoose.connection.once('open', function cbOnConnectionOpen() {
      logger.info('Database connection opened.', {
        module: 'core',
        tags  : [
          log_tags.init,
          log_tags.db
        ]
      });
    });
  }
};