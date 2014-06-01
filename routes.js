var config = require('./config');

module.exports = function (app) {
  /*
   * API root.
   */
  app.route(config.api.prefix)
    .get(require('./routes/index'));

  /*
   * System.
   */
  app.route(config.api.prefix + '/system')
    .get(require('./routes/system/index'));

  /*
   * System. Info.
   */
  app.route(config.api.prefix + '/system/info')
    .get(require('./routes/system/info/index'));

  app.route(config.api.prefix + '/system/info/:info')
    .get(require('./routes/system/info/show'));

  /*
   * System. Logging.
   */
  app.route(config.api.prefix + '/system/logging')
    .get(require('./routes/system/logging/index'));

  /*
   * System. Logging. Logs.
   */
  app.route(config.api.prefix + '/system/logging/logs')
    .get(require('./routes/system/logging/logs/index'));

  app.route(config.api.prefix + '/system/logging/logs/:log')
    .get(require('./routes/system/logging/logs/show'));

  /*
   * System. Logging. Settings.
   */
  app.route(config.api.prefix + '/system/logging/settings')
    .get(require('./routes/system/logging/settings/index'));

  app.route(config.api.prefix + '/system/logging/settings/:setting')
    .get(require('./routes/system/logging/settings/show'))
    .patch(require('./routes/system/logging/settings/patch'));

  /*
   * System. Tunables.
   */
  app.route(config.api.prefix + '/system/tunables')
    .get(require('./routes/system/tunables/index'));

  app.route(config.api.prefix + '/system/tunables/:tunable')
    .get(require('./routes/system/tunables/show'))
    .patch(require('./routes/system/tunables/patch'))
    .delete(require('./routes/system/tunables/delete'));

  /*
   * Routing. Settings.
   */
  app.route(config.api.prefix + '/system/settings')
    .get(require('./routes/system/settings/index'));

  app.route(config.api.prefix + '/system/settings/:setting')
    .get(require('./routes/system/settings/show'))
    .patch(require('./routes/system/settings/patch'));

  /*
   * Interfaces.
   */
  app.route(config.api.prefix + '/interfaces')
    .get(require('./routes/interfaces/index'));

  /*
   * Interfaces. Ethernets.
   */
  app.route(config.api.prefix + '/interfaces/ethernets')
    .get(require('./routes/interfaces/ethernets/index'));

  app.route(config.api.prefix + '/interfaces/ethernets/:ethernet')
    .get(require('./routes/interfaces/ethernets/show'))
    .patch(require('./routes/interfaces/ethernets/patch'))
    .delete(require('./routes/interfaces/ethernets/delete'));

  /*
   * Interfaces. Ethernets. Addresses.
   */
  app.route(config.api.prefix + '/interfaces/ethernets/:ethernet/addresses')
    .get(require('./routes/interfaces/ethernets/addresses/index'))
    .post(require('./routes/interfaces/ethernets/addresses/create'));

  app.route(config.api.prefix + '/interfaces/ethernets/:ethernet/addresses/:address')
    .get(require('./routes/interfaces/ethernets/addresses/show'))
    .delete(require('./routes/interfaces/addresses/delete'))
    .patch(require('./routes/interfaces/addresses/patch'));

  /*
   * Interfaces. Loopbacks.
   */
  app.route(config.api.prefix + '/interfaces/loopbacks')
    .get(require('./routes/interfaces/loopbacks/index'));

  app.route(config.api.prefix + '/interfaces/loopbacks/:loopback')
    .get(require('./routes/interfaces/loopbacks/show'))
    .patch(require('./routes/interfaces/loopbacks/patch'))
    .delete(require('./routes/interfaces/loopbacks/delete'));

  /*
   * Interfaces. Loopbacks. Addresses.
   */
  app.route(config.api.prefix + '/interfaces/loopbacks/:loopback/addresses')
    .get(require('./routes/interfaces/loopbacks/addresses/index'))
    .post(require('./routes/interfaces/loopbacks/addresses/create'));

  app.route(config.api.prefix + '/interfaces/loopbacks/:loopback/addresses/:address')
    .get(require('./routes/interfaces/loopbacks/addresses/show'))
    .delete(require('./routes/interfaces/addresses/delete'))
    .patch(require('./routes/interfaces/addresses/patch'));

  /*
   * Interfaces. VLANs.
   */
  app.route(config.api.prefix + '/interfaces/vlans')
    .get(require('./routes/interfaces/vlans/index'))
    .post(require('./routes/interfaces/vlans/create'));

  app.route(config.api.prefix + '/interfaces/vlans/:vlan_interface.:vlan_tag')
    .get(require('./routes/interfaces/vlans/show'))
    .patch(require('./routes/interfaces/vlans/patch'))
    .delete(require('./routes/interfaces/vlans/delete'));

  /*
   * Interfaces. VLANs. Addresses.
   */
  app.route(config.api.prefix + '/interfaces/vlans/:vlan_interface.:vlan_tag/addresses')
    .get(require('./routes/interfaces/vlans/addresses/index'))
    .post(require('./routes/interfaces/vlans/addresses/create'));

  app.route(config.api.prefix + '/interfaces/vlans/:vlan_interface.:vlan_tag/addresses/:address')
    .get(require('./routes/interfaces/vlans/addresses/show'))
    .delete(require('./routes/interfaces/addresses/delete'))
    .patch(require('./routes/interfaces/addresses/patch'));

  /*
   * Routing.
   */
  app.route(config.api.prefix + '/routing')
    .get(require('./routes/routing/index'));

  /*
   * Routing. Settings.
   */
  app.route(config.api.prefix + '/routing/settings')
    .get(require('./routes/routing/settings/index'));

  app.route(config.api.prefix + '/routing/settings/:setting')
    .get(require('./routes/routing/settings/show'))
    .patch(require('./routes/routing/settings/patch'));

  /*
   * Routing. Static.
   */
  app.route(config.api.prefix + '/routing/static')
    .get(require('./routes/routing/static/index'));

  /*
   * Routing. Static. Tables.
   */
  app.route(config.api.prefix + '/routing/static/tables')
    .get(require('./routes/routing/static/tables/index'))
    .post(require('./routes/routing/static/tables/create'));

  app.route(config.api.prefix + '/routing/static/tables/:table')
    .get(require('./routes/routing/static/tables/show'))
    .delete(require('./routes/routing/static/tables/delete'))
    .patch(require('./routes/routing/static/tables/patch'));

  /*
   * Routing. Static. Tables. Routes.
   */
  app.route(config.api.prefix + '/routing/static/tables/:table/routes')
    .get(require('./routes/routing/static/tables/routes/index'))
    .post(require('./routes/routing/static/tables/routes/create'));

  app.route(config.api.prefix + '/routing/static/tables/:table/routes/:route')
    .get(require('./routes/routing/static/tables/routes/show'))
    .delete(require('./routes/routing/static/routes/delete'))
    .patch(require('./routes/routing/static/routes/patch'));

  /*
   * Routing. Static. Rules.
   */
  app.route(config.api.prefix + '/routing/static/rules')
    .get(require('./routes/routing/static/rules/index'))
    .post(require('./routes/routing/static/rules/create'));

  app.route(config.api.prefix + '/routing/static/rules/:rule')
    .get(require('./routes/routing/static/rules/show'))
    .delete(require('./routes/routing/static/rules/delete'))
    .patch(require('./routes/routing/static/rules/patch'));
};