var async = require('async');

var ip_rule = require('iproute').rule;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var Setting = require('../../../../../common/settings/models/setting').Setting;
var setting_statuses = require('../../../../../common/settings/models/setting').statuses;

var package_defaults = require('./defaults');

var StaticRoutingRule = require('../../models/rule').StaticRoutingRule;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
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
     * Add package defaults to OS.
     */
    async.each(package_defaults.rules, function (item, cb_each) {
      /*
       * Don't re-add the special priority 0 rule since it is read-only and never gets deleted from OS.
       */
      if (item.priority != 0) {
        ip_rule.add(item, function (error) {
          if (error) {
            cb_each(error);
            return;
          }

          var rule = new StaticRoutingRule(item);

          // Save the object to database.
          rule.save(function (error) {
            if (error) {
              cb_each(error);
              return;
            }

            cb_each(null);
          });
        });
        return;
      }

      var rule = new StaticRoutingRule(item);

      // Save the object to database.
      rule.save(function (error) {
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

      var setting = new Setting({
        module: 'routing/static/rules',
        name  : 'status',
        value : setting_statuses.enabled
      });

      setting.save(function (error) {
        if (error) {
          logger.error(error.message, {
            module: 'routing/static/rules',
            tags  : [
              log_tags.init,
              log_tags.db
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
    });
  });
};