var config = require('../../../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var NATChain = require('../../../models/chain').NATChain;

module.exports = function (req, res) {
  var json_api_body = {
    links : {
      'chains.rules': req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/services/nat/source/chains/' + req.params.chain + '/rules'
    },
    chains: []
  };

  NATChain.findOne({
    type: 'source',
    name: req.params.chain
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'services/nat/source/chains',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.send(500); // Internal Server Error.
      return;
    }

    if (!doc) {
      res.send(404); // Not found.
      return;
    }

    /*
     * Build JSON API response.
     */
    var buffer = doc.toObject();
    buffer.id = doc._id;

    delete buffer._id;
    delete buffer.__v;

    json_api_body.chains.push(buffer);

    res.json(200, json_api_body); // OK.
  });
};