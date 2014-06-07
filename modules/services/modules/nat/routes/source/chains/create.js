var config = require('../../../../../../../config');

var logger = require('../../../../../../../common/logger').logger;
var log_tags = require('../../../../../../../common/logger').tags;
var log_codes = require('../../../../../../../common/logger').codes;

var NATChain = require('../../../models/chain').NATChain;

module.exports = function (req, res) {
  if (!req.is('application/vnd.api+json')) {
    res.send(415); // Unsupported Media Type.

    return;
  }

  res.type('application/vnd.api+json');

  var json_api_body = {
    links : {
      chains: req.protocol + '://' + req.get('Host') + config.api.prefix + '/services/nat/source/chains/{chains.name}'
    },
    chains: []
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Required values checks.
   */
  if (typeof req.body.chains[0].type == 'undefined') {
    req.body.chains[0].type = 'source';
  }
  if (typeof req.body.chains[0].name == 'undefined') {
    json_api_errors.errors.push({
      code   : log_codes.required_field.code,
      field  : '/chains/0/name',
      message: log_codes.required_field.message
    });
  }

  if (req.body.chains[0].type != 'source') {
    json_api_errors.errors.push({
      code   : log_codes.invalid_value.code,
      field  : '/chains/0/type',
      message: log_codes.invalid_value.message
    });
  }

  if (json_api_errors.errors.length) {
    res.json(400, json_api_errors); // Bad Request.

    return;
  }

  /*
   * Check if the table exists.
   */
  NATChain.findOne({
    type: req.body.chains[0].type,
    name: req.body.chains[0].name
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
       * There is already a table, so throw an error.
       */
      json_api_errors.errors.push({
        code   : log_codes.already_present.code,
        field  : '/chains/0/name',
        message: log_codes.already_present.message
      });

      res.json(400, json_api_errors); // Bad Request.

      return;
    }

    var chain = new NATChain(req.body.chains[0]);

    NATChain.createFromObjectToOS(chain, function (error) {
      if (error) {
        logger.error(error, {
          module: 'services/nat/source/chains',
          tags  : [
            log_tags.api_request,
            log_tags.os
          ]
        });

        res.send(500); // Internal Server Error.

        return;
      }

      /*
       * Save changes to database.
       */
      chain.save(function (error) {
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

        var item_to_send = req.body.chains[0];

        item_to_send.href = req.protocol + '://' + req.get('Host') + config.api.prefix + '/services/nat/source/chains/' + chain.name;
        item_to_send.id = chain._id;

        res.location(item_to_send.href);

        /*
         * Build JSON API response.
         */
        json_api_body.chains = [];
        json_api_body.chains.push(item_to_send);

        res.json(200, json_api_body); // OK.
      });
    });
  });
};