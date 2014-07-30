var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.get('api:prefix') + '/interfaces/loopbacks')
    .get(require('./routes/index'));

  app.route(config.get('api:prefix') + '/interfaces/loopbacks/:loopback')
    .get(require('./routes/show'))
    .put(require('./routes/update'))
    .delete(require('./routes/delete'));

  /*
   * Interfaces. Loopbacks. Addresses.
   */
  app.route(config.get('api:prefix') + '/interfaces/loopbacks/:loopback/addresses')
    .get(require('./routes/addresses/index'))
    .post(require('./routes/addresses/create'));

  app.route(config.get('api:prefix') + '/interfaces/loopbacks/:loopback/addresses/:address')
    .get(require('./routes/addresses/show'))
    .delete(require('../common/addresses/routes/delete'))
    .put(require('../common/addresses/routes/update'));
};