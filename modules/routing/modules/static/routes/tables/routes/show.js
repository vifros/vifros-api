var logger = require('../../../../../../../common/logger').logger;
var log_tags = require('../../../../../../../common/logger').tags;

var StaticRoutingTable = require('../../../models/table').StaticRoutingTable;

var routes_index = require('../../routes/index');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    routes_index(req, res, {
      filter  : {
        _id: req.params.route
      },
      base_url: '/tables/' + req.params.table
    });
  }
  catch (error) {
    logger.error(error.name, {
      module: 'routing/static/tables',
      tags  : [
        log_tags.api_request,
        log_tags.cross_rel
      ]
    });

    res.send(500); // Internal Server Error.
  }
};