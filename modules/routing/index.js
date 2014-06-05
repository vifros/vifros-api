var config = require('../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.api.prefix + '/routing')
    .get(require('./routes/index'));

  /*
   * Routing. Settings.
   */
  app.route(config.api.prefix + '/routing/settings')
    .get(require('./routes/settings/index'));

  app.route(config.api.prefix + '/routing/settings/:setting')
    .get(require('./routes/settings/show'))
    .patch(require('./routes/settings/patch'));
};