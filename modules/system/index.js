var config = require('../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.api.prefix + '/system')
    .get(require('./routes/index'));

  /*
   * System. Settings.
   */
  app.route(config.api.prefix + '/system/settings')
    .get(require('./routes/settings/index'));

  app.route(config.api.prefix + '/system/settings/:setting')
    .get(require('./routes/settings/show'))
    .patch(require('./routes/settings/patch'));
};