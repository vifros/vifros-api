var config = require('../../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var StaticRoutingRule = require('../../models/rule').StaticRoutingRule;
var StaticRoutingTable = require('../../models/table').StaticRoutingTable;

module.exports = function (req, res) {
  var json_api_body = {
    links: {
      rules: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/rules/{rules.priority}'
    },
    rules: {}
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

    /*
     * Build JSON API response.
     */
    var buffer = doc.toObject();
    buffer.id = doc._id;

    delete buffer._id;
    delete buffer.__v;

    json_api_body.rules = buffer;

    res.json(200, json_api_body); // OK.
  });
};