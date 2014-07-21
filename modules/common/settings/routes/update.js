var lodash = require('lodash');

var Setting = require('../models/setting').Setting;

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;
var log_codes = require('../../../../common/logger').codes;

module.exports = function (req, res, options) {
  if (!req.is('application/vnd.api+json')) {
    res.send(415); // Unsupported Media Type.
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

      res.send(500); // Internal Server Error.
      return;
    }

    if (!doc) {
      res.send(404); // Not found.
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
          || property == 'name'
          || property == 'id') {

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

    // TODO: Add validations here.

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

          res.send(500); // Internal Server Error.
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

            res.send(500); // Internal Server Error.
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

        res.send(500); // Internal Server Error.
        return;
      }

      res.send(204); // No Content.
    });
  });
};