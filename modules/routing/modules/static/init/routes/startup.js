var async = require('async');

var ip_route = require('iproute').route;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;

module.exports = function (cb_init) {
  /*
   * Already initialized.
   */
  StaticRoutingRoute.find({}, function (error, docs) {
    if (error) {
      logger.error(error, {
        module: 'routing/static/routes',
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
        // Insert the rule into OS.
        ip_route.replace(item, function (error) {
          if (error) {
            cb_each(error);
            return;
          }

          cb_each(null);
        });
      }, function (error) {
        if (error) {
          logger.error(error, {
            module: 'routing/static/routes',
            tags  : [
              log_tags.init
            ]
          });

          cb_init(error);
          return;
        }

        logger.info('Module started.', {
          module: 'routing/static/routes',
          tags  : [
            log_tags.init
          ]
        });

        cb_init(null);
      });
      return;
    }

    logger.info('Module started.', {
      module: 'routing/static/routes',
      tags  : [
        log_tags.init
      ]
    });

    cb_init(null);
  });
};