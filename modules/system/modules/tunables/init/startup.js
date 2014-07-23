var async = require('async');

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

var Tunable = require('../models/tunable').Tunable;

module.exports = function (cb_init) {
  /*
   * Already initialized.
   */
  /*
   * Get all rules from DB.
   */
  Tunable.find({}, function (error, docs) {
    if (error) {
      logger.error(error, {
        module: 'system/tunables',
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
        // Overwrite OS with the tunable configuration.
        Tunable.createFromObjectToOS(item, function (error) {
          if (error) {
            cb_each(error);
            return;
          }

          cb_each(null);
        });
      }, function (error) {
        if (error) {
          logger.error(error, {
            module: 'system/tunables',
            tags  : [
              log_tags.init
            ]
          });

          cb_init(error);
          return;
        }

        logger.info('Module started.', {
          module: 'system/tunables',
          tags  : [
            log_tags.init
          ]
        });

        cb_init(null);
      });
      return;
    }

    logger.info('Module started.', {
      module: 'system/tunables',
      tags  : [
        log_tags.init
      ]
    });

    cb_init(null);
  });
};
