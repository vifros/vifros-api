var async = require('async');
var iptables = require('netfilter').iptables;
var lodash = require('lodash');

var config = require('../../../../../../../config');
var jsonapi = require('../../../../../../../utils/jsonapi');

var logger = require('../../../../../../../common/logger').logger;
var log_tags = require('../../../../../../../common/logger').tags;
var log_codes = require('../../../../../../../common/logger').codes;

var NATChain = require('../../../models/chain').NATChain;
var NATRule = require('../../../models/rule').NATRule;

module.exports = function (req, res) {
  if (!req.is('application/json-patch+json')) {
    res.send(415); // Unsupported Media Type.
    return;
  }

  var json_api_errors = {
    errors: []
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

    try {
      var doc_patch = jsonapi.patchObject({
        doc          : doc,
        resource_name: 'chains',
        model        : NATChain,
        req          : req
      });
    }
    catch (error) {
      logger.error(error, {
        module: 'services/nat/source/chains',
        tags  : [
          log_tags.api_request
        ]
      });

      json_api_errors.errors.push({
        code   : log_codes.json_patch_error.code,
        message: log_codes.json_patch_error.message
      });

      res.json(400, json_api_errors); // Bad Request.
      return;
    }

    /*
     * Validate resulting document from patch.
     */
    var valid_changed_options = {};
    for (var i = 0, j = req.body.length;
         i < j;
         i++) {

      var path = req.body[i].path.split('/chains/0/')[1];

      // Check for readonly params.
      if (path == 'type') {
        json_api_errors.errors.push({
          code   : log_codes.readonly_field.code,
          field  : '/chains/0/type',
          message: log_codes.readonly_field.message
        });
      }
      else {
        valid_changed_options[path] = req.body[i].value;
      }
    }

    // Run the field validations.
    NATChain.validate(doc_patch.chains[0], function (error, api_errors) {
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

      if (lodash.isEmpty(valid_changed_options)) {
        // There were no valid changed properties.
        res.send(304); // Not Modified.
        return;
      }

      /*
       * There were changed valid properties so update them.
       */
      async.series([
        function (cb_series) {
          if (valid_changed_options.description
            || valid_changed_options.oif) {

            // Delete the binding rule from built-in chains.
            var rule_options = NATChain.buildRuleOptions(doc);
            iptables.delete(rule_options, function (error) {
              if (error) {

                cb_series(error);
                return;
              }

              var new_rule_options = NATChain.buildRuleOptions(doc_patch.chains[0]);
              iptables.append(new_rule_options, function (error) {
                if (error) {
                  cb_series(error);
                  return;
                }

                cb_series(null);
              });
            });
            return;
          }

          cb_series(null);
        },
        function (cb_series) {
          if (valid_changed_options.name) {
            var old_name = 'source-' + req.params.chain;
            var new_name = 'source-' + doc_patch.chains[0].name;

            iptables.rename({
              table   : 'nat',
              old_name: old_name,
              new_name: new_name
            }, function (error) {
              if (error) {
                cb_series(error);
                return;
              }

              NATRule.update({
                  chain: req.params.chain
                }, {
                  chain: doc_patch.chains[0].name
                },
                { multi: true }, // To update multiple documents.
                function (error) {
                  if (error) {
                    cb_series(error);
                    return;
                  }

                  cb_series(null);
                });
            });
            return;
          }

          cb_series(null);
        }
      ], function (error) {
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

        NATChain.findOneAndUpdate({
          type: 'source',
          name: req.params.chain
        }, doc_patch.chains[0], function (error) {
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

          res.send(204); // No Content.
        });
      });
    });
  });
};