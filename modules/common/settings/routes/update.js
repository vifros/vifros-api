var lodash = require('lodash');

var Setting = require('../models/setting').Setting;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

module.exports = function (req, res, options) {
  if (!req.is('application/vnd.api+json')) {
    res.json(415, {
      errors: [
        {
          code : 'unsupported_media_type',
          title: 'Unsupported Media Type.'
        }
      ]
    }); // Unsupported Media Type.
    return;
  }

  var json_api_errors = {
    errors: []
  };

  Setting.findOne({
    name: req.params.setting
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'common/settings',
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
    for (var property in req.body.settings) {
      if (req.body.settings.hasOwnProperty(property)) {
        // Check for readonly params.
        if (property == 'module'
          || property == 'name') {

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
    for (var property in req.body.settings) {
      if (req.body.settings.hasOwnProperty(property)) {
        doc[property] = req.body.settings[property];
      }
    }

    /*
     * Cross relationships functionality execution.
     * If this is used it means that changing this setting have side effects.
     */
    if (options && options.cb_update) {
      options.cb_update(doc, function (error) {
        if (error) {
          logger.error(error, {
            module: 'common/settings',
            tags  : [
              log_tags.cross_rel
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

        doc.update(req.body.settings, function (error) {
          if (error) {
            logger.error(error.message, {
              module: 'common/settings',
              tags  : [
                log_tags.api_request
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
      return;
    }

    doc.update(req.body.settings, function (error) {
      if (error) {
        logger.error(error.message, {
          module: 'common/settings',
          tags  : [
            log_tags.api_request
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
};