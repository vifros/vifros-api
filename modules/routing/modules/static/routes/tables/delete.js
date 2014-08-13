var async = require('async');

var routing_tables = require('iproute').utils.routing_tables;

var config = require('../../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;
var StaticRoutingRule = require('../../models/rule').StaticRoutingRule;
var StaticRoutingTable = require('../../models/table').StaticRoutingTable;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  if (req.params.table == '0'
    || req.params.table == '253'
    || req.params.table == '254'
    || req.params.table == '255') {

    json_api_errors.errors.push({
      code : log_codes.readonly_resource.code,
      title: log_codes.readonly_resource.message
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
              if (error
                && (error.server_code && error.server_code != 404)) {

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
              if (error
                && (error.server_code && error.server_code != 404)) {

                cb_parallel(error);
                return;
              }

              cb_parallel(null);
            });
          }
        ], function (error) {
          if (error) {
            json_api_errors.errors = error.errors;

            res.json(error.server_code, json_api_errors);
            return;
          }

          res.send(204); // No Content.
        });
      });
    });
  });
};