var async = require('async');

var routing_tables = require('iproute').utils.routing_tables;

var config = require('../../../../config');

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;
var log_codes = require('../../../../common/logger').codes;

var StaticRoutingRoute = require('../../../../models/routing/static/route').StaticRoutingRoute;
var StaticRoutingRule = require('../../../../models/routing/static/rule').StaticRoutingRule;
var StaticRoutingTable = require('../../../../models/routing/static/table').StaticRoutingTable;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_errors = {
    errors: []
  };

  if (req.params.table == '0'
    || req.params.table == '253'
    || req.params.table == '254'
    || req.params.table == '255') {

    json_api_errors.errors.push({
      code   : log_codes.readonly_resource.code,
      message: log_codes.readonly_resource.message
    });

    res.json(403, json_api_errors); // Forbidden.

    return;
  }

  StaticRoutingTable.findOne({
    id: req.params.table
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/tables',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.send(500); // Internal Server Error.

      return;
    }

    if (doc) {
      /*
       * Remove the table from OS.
       */
      routing_tables.delete(doc, function (error) {
        if (error) {
          logger.error(error.message, {
            module: 'routing/static/tables',
            tags  : [
              log_tags.api_request,
              log_tags.os
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        /*
         * Delete table in DB.
         */
        StaticRoutingTable.findOneAndRemove({
          id: req.params.table
        }, function (error) {
          if (error) {
            logger.error(error.message, {
              module: 'routing/static/tables',
              tags  : [
                log_tags.api_request,
                log_tags.db
              ]
            });

            res.send(500); // Internal Server Error.

            return;
          }

          /*
           * Remove all related resources.
           */
          async.parallel([
            function (cb_parallel) {
              /*
               * Delete static routes.
               */
              StaticRoutingRoute.purgeFromOSandDB({
                filter: {
                  table: req.params.table
                }
              }, function (error) {
                if (error) {
                  cb_parallel(error);

                  return;
                }

                cb_parallel(null);
              });
            },
            function (cb_parallel) {
              /*
               * Delete rules.
               */
              StaticRoutingRule.purgeFromOSandDB({
                filter: {
                  table: req.params.table
                }
              }, function (error) {
                if (error) {
                  logger.error(error.message, {
                    module: 'routing/static/tables',
                    tags  : [
                      log_tags.api_request,
                      log_tags.db
                    ]
                  });

                  cb_parallel(error);

                  return;
                }

                cb_parallel(null);
              });
            }
          ], function (error) {
            if (error) {
              for (var i = 0, j = error.errors.length;
                   i < j;
                   i++) {

                json_api_errors.errors.push({
                  code   : error.errors[i].code,
                  field  : error.errors[i].field,
                  message: error.errors[i].message
                });
              }

              res.json(error.server_code, json_api_errors);

              return;
            }

            res.send(204); // No Content.
          });
        });
      });

      return;
    }

    res.send(404); // Not found.
  });
};