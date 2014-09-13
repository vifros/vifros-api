var ip_rule = require('iproute').rule;

var config = require('../../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;
var StaticRoutingRule = require('../../models/rule').StaticRoutingRule;

module.exports = function (req, res) {
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

  var json_api_body = {
    links: {
      rules: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/rules/{rules.priority}'
    },
    rules: {}
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Check for required values.
   */
  var failed_required_fields = [];

  if (typeof req.body.rules.type == 'undefined') {
    failed_required_fields.push('type');
  }
  if (typeof req.body.rules.priority == 'undefined') {
    failed_required_fields.push('priority');
  }
  if (typeof req.body.rules.table == 'undefined') {
    failed_required_fields.push('table');
  }

  if (failed_required_fields.length) {
    // Build the error response with the required fields.
    for (var i = 0, j = failed_required_fields.length;
         i < j;
         i++) {

      json_api_errors.errors.push({
        code : log_codes.required_field.code,
        path : failed_required_fields[i],
        title: log_codes.required_field.message
      });
    }

    res.json(400, json_api_errors); // Bad Request.
    return;
  }

  /*
   * Check if the table exists.
   */
  StaticRoutingTable.findOne({
    id: req.body.rules.table
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
      json_api_errors.errors.push({
        code : log_codes.related_resource_not_found.code,
        path : 'table',
        title: log_codes.related_resource_not_found.message.replace('%s', 'table')
      });

      res.json(400, json_api_errors); // Bad Request.
    }

    /*
     * Check if there is already a rule with the same priority.
     */
    StaticRoutingRule.findOne({
      priority: req.body.rules.priority
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

      if (doc) {
        // There was already an object with that data.
        json_api_errors.errors.push({
          code   : log_codes.already_present.code,
          field  : 'priority',
          message: log_codes.already_present.message
        });

        res.json(400, json_api_errors); // Bad Request.
        return;
      }

      // Run the field validations.
      StaticRoutingRule.validate(req.body.rules, function (error, api_errors) {
        if (error) {
          logger.error(error, {
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

        if (api_errors.length) {
          res.json(400, {
            errors: api_errors
          }); // Bad Request.
          return;
        }

        var rule = new StaticRoutingRule(req.body.rules);
        ip_rule.add(rule, function (error) {
          if (error) {
            logger.error(error, {
              module: 'routing/static/rules',
              tags  : [
                log_tags.api_request,
                log_tags.os
              ]
            });

            res.send(500); // Internal Server Error.
            return;
          }

          /*
           * Save changes to database.
           */
          rule.save(function (error) {
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

            var item_to_send = req.body.rules;

            item_to_send.href = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/rules/' + rule.priority;

            res.location(item_to_send.href);

            /*
             * Build JSON API response.
             */
            json_api_body.rules = item_to_send;

            res.json(200, json_api_body); // OK.
          });
        });
      });
    });
  });
};