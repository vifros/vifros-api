var config = require('../../../../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var NATRule = require('../../../../models/rule').NATRule;

module.exports = function (req, res) {
  var json_api_body = {
    links: {
      rules: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/services/nat/source/rules/{rules.id}'
    },
    rules: []
  };

  NATRule.findById(req.params.rule, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'services/nat/source/rules',
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

      res.json(200, json_api_body); // OK.

      return;
    }

    res.send(404); // Not found.
  });
};