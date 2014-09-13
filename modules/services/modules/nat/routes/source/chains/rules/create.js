var config = require('../../../../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var NATChain = require('../../../../models/chain').NATChain;
var NATRule = require('../../../../models/rule').NATRule;

module.exports = function (req, res) {
  if (!req.is('application/vnd.api+json')) {
    res.send(415); // Unsupported Media Type.

    return;
  }

  var json_api_body = {
    links: {
      rules: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/services/nat/source/chains/' + req.params.chain + '/rules/{rules.id}'
    },
    rules: []
  };

  var json_api_errors = {
    errors: []
  };

  NATChain.findOne({
    type: 'source',
    name: req.params.chain
  }, function (error, doc) {
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

    if (!doc) {
      // There is no such parent chain so don't add the rule.
      res.send(404); // Not Found.

      return;
    }

    /*
     * Required values checks.
     */
    if (typeof req.body.rules[0].to_nat == 'undefined'
      || (typeof req.body.rules[0].to_nat && typeof req.body.rules[0].to_nat.field == 'undefined')) {

      json_api_errors.errors.push({
        code   : log_codes.required_field.code,
        field  : '/rules/0/to_nat/field',
        message: log_codes.required_field.message
      });
    }

    if (json_api_errors.errors.length) {
      res.json(400, json_api_errors); // Bad Request.

      return;
    }

    var rule = new NATRule(req.body.rules[0]);
    rule.chain = req.params.chain;

    NATRule.createFromObjectToOS(rule, function (error) {
      if (error) {
        logger.error(error, {
          module: 'services/nat/source/rules',
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
      rule.save(function (error) {
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

        var item_to_send = req.body.rules[0];

        item_to_send.href = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/services/nat/source/chains/' + req.params.chain + '/rules/' + rule.id;
        item_to_send.id = rule._id;

        res.location(item_to_send.href);

        /*
         * Build JSON API response.
         */
        json_api_body.rules = [];
        json_api_body.rules.push(item_to_send);

        res.json(200, json_api_body); // OK.
      });
    });
  });
};