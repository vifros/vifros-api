var async = require('async');

var config = require('../../../../../../config');

var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;

var jsonapi = require('../../../../../../utils/jsonapi');

module.exports = function (req, res) {
  var json_api_body = {
    links : {
      tables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/tables/{tables.id}'
    },
    tables: []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'tables',
    model        : StaticRoutingTable
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'tables',
    model        : StaticRoutingTable
  });

  StaticRoutingTable.find(query_filter, {}, query_options, function (error, docs) {
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

    if (docs && docs.length) {
      async.parallel([
        function (cb_parallel) {
          async.each(docs, function (item, cb_each) {
            var buffer = item.toObject();

            delete buffer._id;
            delete buffer.__v;

            json_api_body.tables.push(buffer);

            cb_each(null);
          }, function (error) {
            if (error) {
              cb_parallel(error);

              return;
            }

            cb_parallel(null);
          });
        },
        function (cb_parallel) {
          StaticRoutingTable.count(query_filter, function (error, count) {
            if (error) {
              cb_parallel(error);

              return;
            }

            json_api_body['meta'] = {
              tables: {
                total : count,
                limit : Number(query_options.limit),
                offset: Number(query_options.skip)
              }
            };

            cb_parallel(null);
          });
        }
      ], function (error) {
        if (error) {
          logger.error(error, {
            module: 'routing/static/tables',
            tags  : [
              log_tags.api_request
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        res.json(200, json_api_body); // OK.
      });

      return;
    }

    res.send(404); // Not found.
  });
};