var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../../models/common/setting').Setting;
var Loopback = require('../../../models/interfaces/loopback').Loopback;

var startup = require('./startup');
var install = require('./install');

module.exports = function (cb_init) {
  Setting.findOne({
    module: 'interfaces/loopbacks',
    name  : 'status'
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'interfaces/loopbacks',
        tags  : [
          log_tags.init,
          log_tags.db,
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
        Loopback.setMonitor(function (error) {
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
     */
    install(function (error) {
      if (error) {
        cb_init(error);

        return;
      }

      /*
       * Monitor changes on interface to update operational state.
       */
      Loopback.setMonitor(function (error) {
        if (error) {
          cb_init(error);

          return;
        }

        cb_init(null);
      });
    });
  });
};