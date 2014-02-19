var mongoose = require('mongoose');

var config = require('../config');

var logger = require('./logger').logger;
var log_tags = require('./logger').tags;

module.exports = {
	connect: function () {
		// Open DB connection to database.
		mongoose.connect(config.database.host, config.database.name);

		/*
		 * Database checks.
		 */
		mongoose.connection.on('error', function (error) {
			logger.error(error, {
				module: 'core',
				tags  : [
					log_tags.init,
					log_tags.db
				]
			});
		});

		mongoose.connection.once('open', function () {
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