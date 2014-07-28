var ip_route = require('iproute').route;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var config = require('../../../../../../config');

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;
var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;

module.exports = function (req, res, options) {
  if (!req.is('application/vnd.api+json')) {
    res.send(415); // Unsupported Media Type.

    return;
  }

  var json_api_body = {
    links : {
      routes: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static' + options.base_url + '/routes/{routes.id}'
    },
    routes: []
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Check for required values.
   */
  var failed_required_fields = [];

  if (typeof req.body.routes[0].to == 'undefined') {
    failed_required_fields.push('to');
  }
  if (typeof req.body.routes[0].type == 'undefined') {
    failed_required_fields.push('type');
  }
  if (typeof req.body.routes[0].table == 'undefined') {
    failed_required_fields.push('table');
  }
  if (typeof req.body.routes[0].via == 'undefined') {
    failed_required_fields.push('via');
  }

  if (failed_required_fields.length) {
    // Build the error response with the required fields.
    for (var i = 0, j = failed_required_fields.length;
         i < j;
         i++) {

      json_api_errors.errors.push({
        code   : log_codes.required_field.code,
        field  : '/routes/0/' + failed_required_fields[i],
        message: log_codes.required_field.message
      });
    }

    res.json(400, json_api_errors); // Bad Request.

    return;
  }

  /*
   * Check if the table exists.
   */
  StaticRoutingTable.findOne({
    id: req.body.routes[0].table
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/routes',
        tags  : [
          log_tags.api_request
        ]
      });

      res.send(500); // Internal Server Error.

      return;
    }

    if (doc) {
      /*
       * Check if there is already a route with the same to.
       */
      StaticRoutingRoute.findOne({
        to: req.body.routes[0].to
      }, function (error, doc) {
        if (error) {
          logger.error(error.message, {
            module: 'routing/static/routes',
            tags  : [
              log_tags.api_request
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        if (doc) {
          /*
           * There is already a table, so throw an error.
           */
          json_api_errors.errors.push({
            code   : log_codes.already_present.code,
            field  : '/routes/0/to',
            message: log_codes.already_present.message
          });

          res.json(500, json_api_errors); // Internal Server Error.

          return;
        }

        var route = new StaticRoutingRoute(req.body.routes[0]);

        ip_route.add(route, function (error) {
          if (error) {
            logger.error(error, {
              module: 'routing/static/routes',
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
          route.save(function (error) {
            if (error) {
              logger.error(error.message, {
                module: 'routing/static/routes',
                tags  : [
                  log_tags.api_request,
                  log_tags.db
                ]
              });

              res.send(500); // Internal Server Error.

              return;
            }

            var item_to_send = req.body.routes[0];

            item_to_send.href = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static' + options.base_url + '/routes/' + route._id;
            item_to_send.id = route._id;

            res.location(item_to_send.href);

            /*
             * Build JSON API response.
             */
            json_api_body.routes = [];
            json_api_body.routes.push(item_to_send);

            res.json(200, json_api_body); // OK.
          });
        });
      });

      return;
    }

    json_api_errors.errors.push({
      code   : log_codes.related_resource_not_found.code,
      field  : '/routes/0/table',
      message: log_codes.related_resource_not_found.message.replace('%s', 'table')
    });

    res.send(404); // Not found.
  });
};