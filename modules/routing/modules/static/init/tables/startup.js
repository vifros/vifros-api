var ip_routing_tables = require('iproute').utils.routing_tables;

var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;

module.exports = function (cb_init) {
  /*
   * Already initialized.
   */
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

    StaticRoutingTable.find({}, function (error, docs) {
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

      if (docs && docs.length) {
        // Insert the tables into OS.
        ip_routing_tables.add(docs, function (error) {
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

          logger.info('Module started.', {
            module: 'routing/static/tables',
            tags  : [
              log_tags.init
            ]
          });

          cb_init(null);
        });

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
};