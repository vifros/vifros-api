var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.get('api:prefix') + '/interfaces/vlans')
    .get(require('./routes/index'))
    .post(require('./routes/create'));

  app.route(config.get('api:prefix') + '/interfaces/vlans/:vlan_interface.:vlan_tag')
    .get(require('./routes/show'))
    .patch(require('./routes/patch'))
    .delete(require('./routes/delete'));

  /*
   * Interfaces. VLANs. Addresses.
   */
  app.route(config.get('api:prefix') + '/interfaces/vlans/:vlan_interface.:vlan_tag/addresses')
    .get(require('./routes/addresses/index'))
    .post(require('./routes/addresses/create'));

  app.route(config.get('api:prefix') + '/interfaces/vlans/:vlan_interface.:vlan_tag/addresses/:address')
    .get(require('./routes/addresses/show'))
    .delete(require('../common/addresses/routes/delete'))
    .patch(require('../common/addresses/routes/patch'));
};