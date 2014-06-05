var logger = require('../../../../../../../common/logger').logger;
var log_tags = require('../../../../../../../common/logger').tags;

var StaticRoutingTable = require('../../../models/table').StaticRoutingTable;

var routes_create = require('../../routes/create');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

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
      try {
        /*
         * Delegate the responsibility to send the response to this method.
         */
        routes_create(req, res, {
          base_url: '/tables/' + req.params.table
        });
      }
      catch (error) {
        logger.error(error.message, {
          module: 'routing/static/tables',
          tags  : [
            log_tags.api_request
          ]
        });

        res.send(500); // Internal Server Error.
      }

      return;
    }

    res.send(404); // Not found.
  });
};