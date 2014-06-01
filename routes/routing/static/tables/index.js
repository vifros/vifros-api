var async = require('async');

var config = require('../../../../config');

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var StaticRoutingTable = require('../../../../models/routing/static/table').StaticRoutingTable;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_body = {
    links : {
      tables: req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/tables/{tables.id}'
    },
    tables: []
  };

  var json_api_errors = {
    errors: []
  };

  StaticRoutingTable.find({}, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/tables',
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
      async.each(docs, function (item, cb_each) {
        var buffer = item.toObject();

        delete buffer._id;
        delete buffer.__v;

        json_api_body.tables.push(buffer);

        cb_each(null);
      }, function (error) {
        if (error) {
          logger.error(error, {
            module: 'routing/static/tables',
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

        res.json(200, json_api_body); // OK.
      });

      return;
    }

    res.json(404, json_api_body); // Not found.
  });
};