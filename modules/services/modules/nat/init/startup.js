var async = require('async');

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

var NATChain = require('../models/chain').NATChain;
var NATRule = require('../models/rule').NATRule;

module.exports = function (cb_init) {
  /*
   * Already initialized.
   */
  async.series([
    function (cb_series) {
      /*
       * Clear system.
       */
      NATChain.purgeFromOS({}, function (error) {
        if (error) {
          cb_series(error);

          return;
        }

        cb_series(error);
      });
    },
    function (cb_series) {
      /*
       * Set default NAT global policy.
       */
      NATChain.setDefaultPolicy(function (error) {
        if (error) {
          cb_series(error);

          return;
        }

        cb_series(error);
      });
    },
    function (cb_series) {
      /*
       * Get all chains from DB.
       */
      NATChain.find({}, function (error, docs) {
        if (error) {
          cb_series(error);

          return;
        }

        if (docs && docs.length) {
          async.eachSeries(docs, function (item, cb_each) {
            NATChain.createFromObjectToOS(item, function (error) {
              if (error) {
                cb_each(error);

                return;
              }

              cb_each(null);
            });
          }, function (error) {
            if (error) {
              cb_series(error);

              return;
            }

            cb_series(null);
          });

          return;
        }

        cb_series(null);
      });
    },
    function (cb_series) {
      /*
       * Get all rules from DB.
       */
      NATRule.find({}, function (error, docs) {
        if (error) {
          cb_series(error);

          return;
        }

        if (docs && docs.length) {
          async.eachSeries(docs, function (item, cb_each) {
            NATRule.createFromObjectToOS(item, function (error) {
              if (error) {
                cb_each(error);

                return;
              }

              cb_each(null);
            });
          }, function (error) {
            if (error) {
              cb_series(error);

              return;
            }

            cb_series(null);
          });

          return;
        }

        cb_series(null);
      });
    }
  ], function (error) {
    if (error) {
      logger.error(error, {
        module: 'services/nat',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(error);

      return;
    }

    logger.info('Module started.', {
      module: 'services/nat',
      tags  : [
        log_tags.init
      ]
    });

    cb_init(null);
  });
};