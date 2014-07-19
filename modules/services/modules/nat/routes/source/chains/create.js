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

  var url_prefix = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/services/nat/source/chains';

  var json_api_body = {
    chains: []
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Validation checks.
   */
  // Required values.
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

  // Run the field validations.
  NATChain.validate(req.body.chains[0], function (error, api_errors) {
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

    if (api_errors.length) {
      json_api_errors.errors = json_api_errors.errors.concat(api_errors);
    }

    if (json_api_errors.errors.length) {
      res.json(400, json_api_errors); // Bad Request.
      return;
    }

    /*
     * Check if the chain exists.
     */
    NATChain.findOne({
      type: req.body.chains[0].type,
      name: req.body.chains[0].name
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

      if (doc) {
        /*
         * There is already a chain with those params, so throw an error.
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
        chain.save(function (error, doc) {
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

          var item_to_send = JSON.parse(JSON.stringify(doc)); // This construction is to do a deep copy.

          item_to_send.href = url_prefix + '/' + item_to_send.name;
          item_to_send.id = item_to_send._id;

          delete item_to_send._id;
          delete item_to_send.__v;

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
  });
};