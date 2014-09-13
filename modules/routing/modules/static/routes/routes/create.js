var ip_route = require('iproute').route;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var config = require('../../../../../../config');

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;
var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;

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

  var json_api_body = {
    links : {
      routes: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static' + options.base_url + '/routes/{routes.id}'
    },
    routes: {}
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Check for required values.
   */
  var failed_required_fields = [];

  if (typeof req.body.routes.to == 'undefined') {
    failed_required_fields.push('to');
  }
  if (typeof req.body.routes.type == 'undefined') {
    failed_required_fields.push('type');
  }

  req.body.routes.table = req.params.table;

  if (typeof req.body.routes.via == 'undefined') {
    failed_required_fields.push('via');
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
   * Check if there is already a route with the same to.
   */
  StaticRoutingRoute.findOne({
    to   : req.body.routes.to,
    table: req.params.table
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/routes',
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

    if (doc) {
      /*
       * There is already a route, so throw an error.
       */
      json_api_errors.errors.push({
        code   : log_codes.already_present.code,
        field  : 'to',
        message: log_codes.already_present.message
      });

      json_api_errors.errors.push({
        code   : log_codes.already_present.code,
        field  : 'table',
        message: log_codes.already_present.message
      });

      res.json(400, json_api_errors); // Bad Request.
      return;
    }

    // Run the field validations.
    StaticRoutingRoute.validate(req.body.routes, function (error, api_errors) {
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
        res.json(400, {
          errors: api_errors
        }); // Bad Request.
        return;
      }

      var route = new StaticRoutingRoute(req.body.routes);
      ip_route.add(route, function (error) {
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

        /*
         * Save changes to database.
         */
        route.save(function (error) {
          if (error) {
            logger.error(error.message, {
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

          var item_to_send = req.body.routes;
          delete item_to_send.table;

          item_to_send.href = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static' + options.base_url + '/routes/' + route._id;
          item_to_send.id = route._id;

          res.location(item_to_send.href);

          /*
           * Build JSON API response.
           */
          json_api_body.routes = {};
          json_api_body.routes = item_to_send;

          res.json(200, json_api_body); // OK.
        });
      });
    });
  });
};