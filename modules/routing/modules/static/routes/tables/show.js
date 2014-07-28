var config = require('../../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;

module.exports = function (req, res) {
  var json_api_body = {
    links : {
      tables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/tables/{tables.id}'
    },
    tables: []
  };

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
      /*
       * Build JSON API response.
       */
      var buffer = doc.toObject();

      delete buffer._id;
      delete buffer.__v;

      json_api_body.tables.push(buffer);

      res.json(200, json_api_body); // OK.

      return;
    }

    res.send(404); // Not found.
  });
};