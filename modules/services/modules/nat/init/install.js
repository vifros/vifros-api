var async = require('async');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var Setting = require('../../../../common/settings/models/setting').Setting;
var setting_statuses = require('../../../../common/settings/models/setting').statuses;

var package_defaults = require('./defaults');

var NATChain = require('../models/chain').NATChain;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
   */
  async.series([
    function (cb_series) {
      /*
       * Clear chains in the system.
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
       * Install all default chains.
       */
      async.eachSeries(package_defaults.chains, function (item, cb_each) {
        NATChain.createFromObjectToOS(item, function (error) {
          if (error) {
            cb_each(error);
            return;
          }

          var chain = new NATChain(item);

          // Save the object to database.
          chain.save(function (error) {
            if (error) {
              cb_each(error);
              return;
            }

            cb_each(null);
          });
        });
      }, function (error) {
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
        module: 'services/nat',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(error);
      return;
    }

    var setting = new Setting({
      module: 'services/nat',
      name  : 'status',
      value : setting_statuses.enabled
    });

    setting.save(function (error) {
      if (error) {
        logger.error(error, {
          module: 'services/nat',
          tags  : [
            log_tags.init,
            log_tags.db
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
  });
};