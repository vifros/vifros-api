var async = require('async');

var config = require('../../../../../../config');
var lodash = require('lodash');

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;
var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;

var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var jsonapi = require('../../../../../../utils/jsonapi');

module.exports = function (req, res, options) {
  /*
   * Check for external calling.
   */
  var is_public_call = false;
  if (typeof options == 'object') {
    is_public_call = true;
  }

  /*
   * Check for document inclusion.
   */
  var requested_docs_to_include = req.query.include;
  var is_tables_requested = false;

  /*
   * Check if tables documents were requested too.
   */
  if (typeof requested_docs_to_include != 'undefined'
    && requested_docs_to_include.split(',').indexOf('tables') != -1) {

    is_tables_requested = true;
  }

  var json_api_body = {
    links : {
      routes: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static' + options.base_url + '/routes/{routes.id}'
    },
    routes: []
  };

  /*
   * Add linked data if was requested to response.
   */
  if (is_tables_requested) {
    json_api_body.links['routes.table'] = {
      href: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static' + options.base_url + '/{routes.table}',
      type: 'tables'
    };

    json_api_body['linked'] = {
      tables: []
    };
  }

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'routes',
    model        : StaticRoutingRoute
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'routes',
    model        : StaticRoutingRoute
  });

  var filter = {};
  if (is_public_call && typeof options.filter != 'undefined') {
    filter = options.filter;
  }

  // TODO: Find a way to do a merge to let go `lodash`.
  query_filter = lodash.merge(query_filter, filter);

  StaticRoutingRoute.find(query_filter, {}, query_options, function (error, docs) {
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

    if (docs && docs.length) {
      if (is_tables_requested) {
        var related_table_ids = [];
      }

      async.parallel([
        function (cb_parallel) {
          async.each(docs, function (item, cb_each) {
            var buffer = item.toObject();
            buffer.id = item._id;

            delete buffer._id;
            delete buffer.__v;

            if (is_tables_requested
              && related_table_ids.indexOf(buffer.table) == -1) {

              related_table_ids.push(buffer.table);
            }

            json_api_body.routes.push(buffer);

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
          StaticRoutingRoute.count(query_filter, filter, function (error, count) {
            if (error) {
              cb_parallel(error);

              return;
            }

            json_api_body['meta'] = {
              routes: {
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
          logger.error(error.message, {
            module: 'routing/static/routes',
            tags  : [
              log_tags.api_request
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        if (is_tables_requested) {
          /*
           * Now process the related tables.
           */
          // Rebuild `or` array to find in one query.
          var or_tables_arr = [];

          for (var i = 0, j = related_table_ids.length;
               i < j;
               i++) {

            or_tables_arr.push({
              'id': related_table_ids[i]
            });
          }

          StaticRoutingTable.find({
            $or: or_tables_arr
          }, function (error, docs) {
            if (error) {
              res.send(500); // Internal Server Error.

              return;
            }

            if (docs && docs.length) {
              for (var i = 0, j = docs.length;
                   i < j;
                   i++) {

                var buffer_tables = docs[i].toObject();

                delete buffer_tables._id;
                delete buffer_tables.__v;

                json_api_body.linked.tables.push(buffer_tables);
              }
            }

            res.json(200, json_api_body); // OK.
          });

          return;
        }

        res.json(200, json_api_body); // OK.
      });

      return;
    }

    res.send(404); // Not found.
  });
};