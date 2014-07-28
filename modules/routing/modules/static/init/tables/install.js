var async = require('async');

var ip_routing_tables = require('iproute').utils.routing_tables;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var Setting = require('../../../../../common/settings/models/setting').Setting;
var setting_statuses = require('../../../../../common/settings/models/setting').statuses;

var package_defaults = require('./defaults');

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
   */
  // Clear all OS tables.
  ip_routing_tables.flush(function (error) {
    if (error) {
      logger.error(error, {
        module: 'routing/static/tables',
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
    ip_routing_tables.add(package_defaults.tables, function (error) {
      if (error) {
        logger.error(error, {
          module: 'routing/static/tables',
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
      async.each(package_defaults.tables, function (item, cb_each) {
        var table = new StaticRoutingTable(item);

        // Save the object to database.
        table.save(function (error) {
          if (error) {
            cb_each(error);

            return;
          }

          cb_each(null);
        });
      }, function (error) {
        if (error) {
          logger.error(error, {
            module: 'routing/static/tables',
            tags  : [
              log_tags.init,
              log_tags.os
            ]
          });

          cb_init(error);

          return;
        }
        var setting = new Setting({
          module: 'routing/static/tables',
          name  : 'status',
          value : setting_statuses.enabled
        });

        setting.save(function (error) {
          if (error) {
            logger.error(error, {
              module: 'routing/static/tables',
              tags  : [
                log_tags.init,
                log_tags.db
              ]
            });

            cb_init(error);

            return;
          }

          logger.info('Module started.', {
            module: 'routing/static/tables',
            tags  : [
              log_tags.init
            ]
          });

          cb_init(null);
        });
      });
    });
  });
};