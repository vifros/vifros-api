var lodash = require('lodash');

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;
var log_codes = require('../../../../../common/logger').codes;

var Tunable = require('../models/tunable').Tunable;

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

  Tunable.findOne({
    path: req.params.tunable
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'system/tunables',
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

    if (!doc) {
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
    for (var property in req.body.tunables) {
      if (req.body.tunables.hasOwnProperty(property)) {
        // Check for readonly params.
        if (property == 'path') {
          json_api_errors.errors.push({
            code : log_codes.readonly_field.code,
            path : property,
            title: log_codes.readonly_field.message
          });
        }
        else {
          valid_changed_options[property] = req.body.tunables[property];
        }
      }
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

    /*
     * Update values.
     */
    for (var property in req.body.tunables) {
      if (req.body.tunables.hasOwnProperty(property)) {
        doc[property] = req.body.tunables[property];
      }
    }

    if (Object.keys(valid_changed_options).length == 1
      && valid_changed_options.hasOwnProperty('description')) {

      // If only the description was changed, only save it to DB without touching the OS.
      doc.update(req.body.tunables, function (error) {
        if (error) {
          logger.error(error.message, {
            module: 'system/tunables',
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
      return;
    }

    Tunable.createFromObjectToOS(doc, function (error) {
      if (error) {
        logger.error(error, {
          module: 'system/tunables',
          tags  : [
            log_tags.api_request,
            log_tags.os
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

      doc.update(req.body.tunables, function (error) {
        if (error) {
          logger.error(error.message, {
            module: 'system/tunables',
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
    });
  });
};