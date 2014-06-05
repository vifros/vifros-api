var config = require('../../../../../../config');

var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var StaticRoutingRule = require('../../models/rule').StaticRoutingRule;
var StaticRoutingTable = require('../../models/table').StaticRoutingTable;

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
      'rules.table': req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/tables/' + '{rules.table}'
    },
    rules: []
  };

  /*
   * Add linked data if was requested to response.
   */
  if (is_tables_requested) {
    json_api_body.links['rules.table'] = {
      href: req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/tables/' + '{rules.table}',
      type: 'tables'
    };

    json_api_body['linked'] = {
      tables: []
    };
  }

  var json_api_errors = {
    errors: []
  };

  StaticRoutingRule.findOne({
    priority: req.params.rule
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/rules',
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
       * Build JSON API response.
       */
      var buffer = doc.toObject();
      buffer.id = doc._id;

      delete buffer._id;
      delete buffer.__v;

      json_api_body.rules.push(buffer);

      if (is_tables_requested) {
        StaticRoutingTable.findOne({
          id: buffer.table
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
            var buffer_tables = doc.toObject();

            delete buffer_tables._id;
            delete buffer_tables.__v;

            json_api_body.linked.tables.push(buffer_tables);
          }

          res.json(200, json_api_body); // OK.
        });

        return;
      }

      res.json(200, json_api_body); // OK.

      return;
    }

    res.send(404); // Not found.
  });
};