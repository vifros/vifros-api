var async = require('async');

var ip_rule = require('iproute').rule;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var StaticRoutingRule = require('../../models/rule').StaticRoutingRule;

module.exports = function (cb_init) {
  /*
   * Already initialized.
   */
  // Clear all OS rules. Note: this will clear all rules but the special priority 0 rule.
  ip_rule.flush(function (error) {
    if (error) {
      logger.error(error, {
        module: 'routing/static/rules',
        tags  : [
          log_tags.init,
          log_tags.os
        ]
      });

      cb_init(error);
      return;
    }

    /*
     * Get all rules from DB.
     */
    StaticRoutingRule.find({}, function (error, docs) {
      if (error) {
        logger.error(error, {
          module: 'routing/static/rules',
          tags  : [
            log_tags.init,
            log_tags.db
          ]
        });

        cb_init(error);
        return;
      }

      if (docs && docs.length) {
        async.each(docs, function (item, cb_each) {
          // The priority 0 rule never gets deleted from OS so pass from it.
          if (item.priority == 0) {
            cb_each(null);
            return;
          }

          // Insert the rule into OS.
          ip_rule.add(item, function (error) {
            if (error) {
              cb_each(error);
              return;
            }

            cb_each(null);
          });
        }, function (error) {
          if (error) {
            logger.error(error, {
              module: 'routing/static/rules',
              tags  : [
                log_tags.init
              ]
            });

            cb_init(error);
            return;
          }

          logger.info('Module started.', {
            module: 'routing/static/rules',
            tags  : [
              log_tags.init
            ]
          });

          cb_init(null);
        });
        return;
      }

      logger.info('Module started.', {
        module: 'routing/static/rules',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(null);
    });
  });
};
