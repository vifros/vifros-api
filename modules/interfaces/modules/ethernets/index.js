var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.api.prefix + '/interfaces/ethernets')
    .get(require('./routes/index'));

  app.route(config.api.prefix + '/interfaces/ethernets/:ethernet')
    .get(require('./routes/show'))
    .patch(require('./routes/patch'))
    .delete(require('./routes/delete'));

  /*
   * Interfaces. Ethernets. Addresses.
   */
  app.route(config.api.prefix + '/interfaces/ethernets/:ethernet/addresses')
    .get(require('./routes/addresses/index'))
    .post(require('./routes/addresses/create'));

  app.route(config.api.prefix + '/interfaces/ethernets/:ethernet/addresses/:address')
    .get(require('./routes/addresses/show'))
    .delete(require('../common/addresses/routes/delete'))
    .patch(require('../common/addresses/routes/patch'));
};