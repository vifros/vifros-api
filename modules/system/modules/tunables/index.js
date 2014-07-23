var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.get('api:prefix') + '/system/tunables')
    .get(require('./routes/index'))
    .post(require('./routes/create'));

  app.route(config.get('api:prefix') + '/system/tunables/:tunable')
    .get(require('./routes/show'))
    .put(require('./routes/update'))
    .delete(require('./routes/delete'));
};