var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.api.prefix + '/system/tunables')
    .get(require('./routes/index'));

  app.route(config.api.prefix + '/system/tunables/:tunable')
    .get(require('./routes/show'))
    .patch(require('./routes/patch'))
    .delete(require('./routes/delete'));
};