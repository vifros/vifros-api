var config = require('../../../../../../../config');

var logger = require('../../../../../../../common/logger').logger;
var log_tags = require('../../../../../../../common/logger').tags;

var NATChain = require('../../../models/chain').NATChain;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_body = {
    links : {
      chains        : req.protocol + '://' + req.get('Host') + config.api.prefix + '/services/nat/source/chains/{chains.name}',
      'chains.rules': req.protocol + '://' + req.get('Host') + config.api.prefix + '/services/nat/source/chains/{chains.name}/rules'
    },
    chains: []
  };

  NATChain.findOne({
    type: 'source',
    name: req.params.chain
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'services/nat/source/chains',
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

      json_api_body.chains.push(buffer);

      res.json(200, json_api_body); // OK.

      return;
    }

    res.send(404); // Not found.
  });
};