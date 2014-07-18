var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

var Setting = require('../../../../common/settings/models/setting').Setting;

var startup = require('./startup');
var install = require('./install');

module.exports = function (cb_init) {
  Setting.findOne({
    module: 'services/nat',
    name  : 'status'
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'services/nat',
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
      startup(cb_init);
      return;
    }

    /*
     * Not yet initialized.
     */
    install(cb_init);
  });
};