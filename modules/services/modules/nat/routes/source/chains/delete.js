var async = require('async');
var iptables = require('netfilter').iptables;

var logger = require('../../../../../../../common/logger').logger;
var log_tags = require('../../../../../../../common/logger').tags;

var NATChain = require('../../../models/chain').NATChain;
var NATRule = require('../../../models/rule').NATRule;

module.exports = function (req, res) {
  // Find a matching chain in the DB.
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

    if (!doc) {
      res.send(404); // Not found.

      return;
    }

    async.series([
      function (cb_series) {
        // Delete binding rule from built-in chains.
        var rule_options = NATChain.buildRuleOptions(doc);

        iptables.delete(rule_options, function (error) {
          if (error) {

            cb_series(error);

            return;
          }

          cb_series(null);
        });
      },
      function (cb_series) {
        // Purge the chain and its rules from OS.
        NATChain.purgeFromOS({
          chain: doc.type + '-' + req.params.chain
        }, function (error) {
          if (error) {

            cb_series(error);

            return;
          }

          cb_series(null);
        });
      },
      function (cb_series) {
        // Remove chain rules from DB.
        NATRule.remove({
          chain: req.params.chain
        }, function (error) {
          if (error) {

            cb_series(error);

            return;
          }

          cb_series(null);
        });
      },
      function (cb_series) {
        // Remove chain from DB.
        doc.remove(function (error) {
          if (error) {

            cb_series(error);

            return;
          }

          cb_series(null);
        });
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

      res.send(204); // No Content.
    });
  });
};