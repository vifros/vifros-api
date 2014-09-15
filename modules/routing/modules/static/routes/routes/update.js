var lodash = require('lodash');

var ip_route = require('iproute').route;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;

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

  StaticRoutingRoute.findOne({
    to   : req.params.route,
    table: req.params.table
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'routing/static/routes',
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
    for (var property in req.body.routes) {
      if (req.body.routes.hasOwnProperty(property)) {
        // Check for readonly params.
        if (property == 'to') {
          json_api_errors.errors.push({
            code : log_codes.readonly_field.code,
            path : 'to',
            title: log_codes.readonly_field.message
          });
        }
        else {
          valid_changed_options[property] = req.body.routes[property];
        }
      }
    }

    /*
     * Update values.
     */
    for (var property in req.body.routes) {
      if (req.body.routes.hasOwnProperty(property)) {
        doc[property] = req.body.routes[property];
      }
    }

    // Run the field validations.
    StaticRoutingRoute.validate(doc, function (error, api_errors) {
      if (error) {
        logger.error(error, {
          module: 'routing/static/routes',
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
        json_api_errors.errors = json_api_errors.errors.concat(api_errors);
      }

      if (json_api_errors.errors.length) {
        res.json(400, json_api_errors); // Bad Request.
        return;
      }

      if (Object.keys(valid_changed_options).length == 1
        && valid_changed_options.hasOwnProperty('description')) {
        // If only the description was changed, only save it to DB without touching the OS.

        doc.update(req.body.routes, function (error) {
          if (error) {
            logger.error(error, {
              module: 'routing/static/routes',
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

      /*
       * Insert the rule into OS.
       */
      ip_route.replace(doc, function (error) {
        if (error) {
          logger.error(error, {
            module: 'routing/static/routes',
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

        // Save changes to DB.
        doc.update(req.body.routes, function (error) {
          if (error) {
            logger.error(error, {
              module: 'routing/static/routes',
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
  });
};