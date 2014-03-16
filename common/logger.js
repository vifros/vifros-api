var winston = require('winston');
require('winston-mongodb').MongoDB; // Monkeypatch Winston for MongoDb transport.

var config = require('../config');

/*
 * Enable initially all transports for initial app startup and then disable them according to settings.
 *
 * Add console transport.
 */
winston.remove(winston.transports.Console); // To being able to reconfigure it.

if (config.logging.transports.console.enabled) {
	winston.add(winston.transports.Console, config.logging.transports.console);
}

/*
 * File transport.
 */
if (config.logging.transports.file.enabled) {
	winston.add(winston.transports.File, config.logging.transports.file);
}

/*
 * Enable saving logs to mongodb.
 */
if (config.logging.transports.mongodb.enabled) {
	winston.add(winston.transports.MongoDB, config.logging.transports.mongodb);
}

exports.logger = winston;

exports.tags = {
	init       : 'init',
	api_request: 'api_request',
	db         : 'db',
	validation : 'validation',
	cross_rel  : 'cross_relationship',
	os         : 'os'
};