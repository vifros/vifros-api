var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.get('api:prefix') + '/interfaces/vlans')
    .get(require('./routes/index'))
    .post(require('./routes/create'));

  app.route(config.get('api:prefix') + '/interfaces/vlans/:vlan')
    .get(require('./routes/show'))
    .put(require('./routes/update'))
    .delete(require('./routes/delete'));

  /*
   * Interfaces. VLANs. Addresses.
   */
  app.route(config.get('api:prefix') + '/interfaces/vlans/:vlan/addresses')
    .get(require('./routes/addresses/index'))
    .post(require('./routes/addresses/create'));

  app.route(config.get('api:prefix') + '/interfaces/vlans/:vlan/addresses/:address')
    .get(require('./routes/addresses/show'))
    .delete(require('../common/addresses/routes/delete'))
    .put(require('../common/addresses/routes/update'));
};