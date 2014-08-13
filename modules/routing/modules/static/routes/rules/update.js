var lodash = require('lodash');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var StaticRoutingRule = require('../../models/rule').StaticRoutingRule;

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

  StaticRoutingRule.findOne({
    priority: req.params.rule
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/rules',
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
    for (var property in req.body.rules) {
      if (req.body.rules.hasOwnProperty(property)) {
        // Check for readonly params.
        if (property != 'description') {
          json_api_errors.errors.push({
            code : log_codes.readonly_field.code,
            path : property,
            title: log_codes.readonly_field.message
          });
        }
        else {
          valid_changed_options[property] = req.body.rules[property];
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
    for (var property in req.body.rules) {
      if (req.body.rules.hasOwnProperty(property)) {
        doc[property] = req.body.rules[property];
      }
    }

    // The description is the only allowed mutable field to be changed.
    doc.update(req.body.rules, function (error) {
      if (error) {
        logger.error(error.message, {
          module: 'routing/static/rules',
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
};