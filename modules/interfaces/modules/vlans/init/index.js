var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

var Setting = require('../../../../common/settings/models/setting').Setting;
var setting_statuses = require('../../../../common/settings/models/setting').statuses;

var VLAN = require('../models/vlan').VLAN;

var startup = require('./startup');

module.exports = function (cb_init) {
  Setting.findOne({
    module: 'interfaces/vlans',
    name  : 'status'
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'interfaces/vlans',
        tags  : [
          log_tags.init,
          log_tags.db
        ]
      });

      cb_init(error);

      return;
    }

    if (doc) {
      /*
       * Already initialized.
       */
      startup(function (error) {
        if (error) {
          cb_init(error);

          return;
        }

        /*
         * Monitor changes on interface to update operational state.
         */
        VLAN.setMonitor(function (error) {
          if (error) {
            cb_init(error);

            return;
          }

          cb_init(null);
        });
      });

      return;
    }

    /*
     * Not yet initialized.
     * Just save the setting and do nothing since there are nothing to be installed nor detected.
     */
    var setting = new Setting({
      module: 'interfaces/vlans',
      name  : 'status',
      value : setting_statuses.enabled
    });

    setting.save(function (error) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/vlans',
          tags  : [
            log_tags.init,
            log_tags.db
          ]
        });

        cb_init(error);

        return;
      }

      logger.info('Module started.', {
        module: 'interfaces/vlans',
        tags  : [
          log_tags.init
        ]
      });

      /*
       * Monitor changes on interface to update operational state.
       */
      VLAN.setMonitor(function (error) {
        if (error) {
          cb_init(error);

          return;
        }

        cb_init(null);
      });
    });
  });
};