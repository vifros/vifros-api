var async = require('async');

var config = require('../../../../config');

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var StaticRoutingTable = require('../../../../models/routing/static/table').StaticRoutingTable;
var StaticRoutingRule = require('../../../../models/routing/static/rule').StaticRoutingRule;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

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
    links: {
      rules        : req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/rules/{rules.priority}',
      'rules.table': req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/tables/{rules.table}'
    },
    rules: []
  };

  /*
   * Add linked data if was requested to response.
   */
  if (is_tables_requested) {
    json_api_body.links['rules.table'] = {
      href: req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/tables/{rules.table}',
      type: 'tables'
    };

    json_api_body['linked'] = {
      tables: []
    };
  }

  var json_api_errors = {
    errors: []
  };

  StaticRoutingRule.find({}, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/rules',
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

        json_api_body.rules.push(buffer);

        cb_each(null);
      }, function (error) {
        if (error) {
          logger.error(error, {
            module: 'routing/static/rules',
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
              logger.error(error.message, {
                module: 'routing/static/rules',
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