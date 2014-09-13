var logger = global.vifros.logger;
var log_tags = logger.tags;

var StaticRoutingTable = require('../../../models/table').StaticRoutingTable;

var routes_create = require('../../routes/create');

module.exports = function (req, res) {
  StaticRoutingTable.findOne({
    id: req.params.table
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'routing/static/tables/routes',
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

    try {
      /*
       * Delegate the responsibility to send the response to this method.
       */
      routes_create(req, res, {
        base_url: '/tables/' + req.params.table
      });
    }
    catch (error) {
      logger.error(error, {
        module: 'routing/static/tables/routes',
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
    }
  });
};