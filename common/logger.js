var winston = require('winston');
require('winston-mongodb').MongoDB; // Monkey-patch Winston for MongoDb transport.

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

exports.codes = {
  json_patch_error              : {
    code   : 'json_patch_error',
    message: 'The JSON patch sent contains errors.'
  },
  readonly_field                : {
    code   : 'readonly_field',
    message: 'The field is readonly and can not be changed.'
  },
  readonly_resource             : {
    code   : 'readonly_resource',
    message: 'The resource is readonly and can not be changed.'
  },
  required_field                : {
    code   : 'required_field',
    message: 'Required field was not provided.'
  },
  delete_present_interface_error: {
    code   : 'delete_present_interface_error',
    message: 'Only interfaces with status NOT_PRESENT can be deleted.'
  },
  already_present               : {
    code   : 'already_present',
    message: 'A resource with the same data is already present.'
  },
  related_resource_not_found    : {
    code   : 'related_resource_not_found',
    message: 'The related resource does not exists yet.'
  },
  invalid_value                 : {
    code   : 'invalid_value',
    message: 'Invalid value for this field'
  }
};