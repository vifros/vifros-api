var async = require('async');

var config = require('../../../../config');

var StaticRoutingTable = require('../../../../models/routing/static/table').StaticRoutingTable;
var StaticRoutingRoute = require('../../../../models/routing/static/route').StaticRoutingRoute;

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

module.exports = function (req, res, options) {
  res.type('application/vnd.api+json');

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
      routes: req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static' + options.base_url + '/routes/{routes.id}'
    },
    routes: []
  };

  /*
   * Add linked data if was requested to response.
   */
  if (is_tables_requested) {
    json_api_body.links['routes.table'] = {
      href: req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static' + options.base_url + '/{routes.table}',
      type: 'tables'
    };

    json_api_body['linked'] = {
      tables: []
    };
  }

  var json_api_errors = {
    errors: []
  };

  var filter = {};
  if (is_public_call && typeof options.filter != 'undefined') {
    filter = options.filter;
  }

  StaticRoutingRoute.find(filter, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/routes',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      json_api_errors.errors.push({
        code   : error.name,
        field  : '',
        message: error.message
      });

      res.json(500, json_api_errors); // Internal Server Error.

      return;
    }

    if (docs && docs.length) {
      if (is_tables_requested) {
        var related_table_ids = [];
      }

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
          logger.error(error.message, {
            module: 'routing/static/routes',
            tags  : [
              log_tags.api_request
            ]
          });

          json_api_errors.errors.push({
            code   : '',
            field  : '',
            message: error
          });

          res.json(500, json_api_errors); // Internal Server Error.

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
              json_api_errors.errors.push({
                code   : error.name,
                field  : '',
                message: error.message
              });

              res.json(500, json_api_errors); // Internal Server Error.

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

    res.json(404, json_api_body); // Not found.
  });
};