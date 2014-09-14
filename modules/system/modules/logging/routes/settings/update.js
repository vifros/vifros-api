// TODO: Add validations on update values.
var winston = require('winston');
var lodash = require('lodash');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var config = require('../../../../../../config');

module.exports = function (req, res) {
  if (!req.is('application/vnd.api+json')) {
    res.json(415, {
      status: '415',
      code  : 'unsupported_media_type',
      title : 'Unsupported Media Type.'
    }); // Unsupported Media Type.
    return;
  }

  var json_api_errors = {
    errors: []
  };

  var valid_settings = [
    'transport_console',
    'transport_file',
    'transport_mongodb'
  ];

  if (valid_settings.indexOf(req.params.setting) == -1) {
    res.json(404, {
      errors: [
        {
          code : 'not_found',
          title: 'Not found.'
        }
      ]
    }); // Not found.
    return;
  }

  /*
   * Validate received object.
   */
  var valid_changed_options = {};
  for (var property in req.body.settings) {
    if (req.body.settings.hasOwnProperty(property)) {
      // Check for readonly params.
      if (property == 'name') {
        json_api_errors.errors.push({
          code : log_codes.readonly_field.code,
          path : property,
          title: log_codes.readonly_field.message
        });
      }
      else {
        valid_changed_options[property] = req.body.settings[property];
      }
    }
  }

  // Required values.
  if (typeof req.body.settings.value == 'undefined') {
    json_api_errors.errors.push({
      code   : log_codes.required_field.code,
      field  : 'value',
      message: log_codes.required_field.message
    });
  }

  if (json_api_errors.errors.length) {
    res.json(400, json_api_errors); // Bad Request.
    return;
  }

  if (lodash.isEmpty(valid_changed_options)) {
    // There were no valid changed properties.
    res.send(304); // Not Modified.
    return;
  }

  var transport_id;
  switch (req.params.setting) {
    case 'transport_console':
      transport_id = 'Console';
      break;

    case 'transport_file':
      transport_id = 'File';
      break;

    case 'transport_mongodb':
      transport_id = 'MongoDB';
      break;

    default:
      // It should not be get to here.
      res.json(404, {
        errors: [
          {
            code : 'not_found',
            title: 'Not found.'
          }
        ]
      }); // Not found.
      return;
      break;
  }

  var current_config = config.get('logging:transports:' + req.params.setting.split('_')[1]);
  var new_config = lodash.merge(current_config, req.body.settings.value);

  /*
   * Update live logger settings.
   */
  try {
    logger.remove(winston.transports[transport_id]);
  }
  catch (error) {
    // TODO: Drop it silently, don't do anything with this error.
  }

  if (new_config.enabled) {
    logger.add(winston.transports[transport_id], new_config);
  }

  config.set('logging:transports:' + req.params.setting.split('_')[1], new_config);
  config.save(function (error) {
    if (error) {
      logger.error(error, {
        module: 'system/logging/settings',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.json(500, {
        errors: [
          {
            code : 'internal_server_error',
            title: 'Internal Server Error.'
          }
        ]
      }); // Internal Server Error.
      return;
    }

    res.send(204); // No Content.
  });
};