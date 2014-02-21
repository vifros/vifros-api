var config = require('./config');

module.exports = function (app) {
	/*
	 * API root.
	 */
	app.get(config.api.prefix, require('./routes/index'));

	/*
	 * System.
	 */
	app.get(config.api.prefix + '/system', require('./routes/system/index'));

	/*
	 * System. Logs.
	 */
	app.get(config.api.prefix + '/system/logs', require('./routes/system/logs/index'));
	app.get(config.api.prefix + '/system/logs/:log', require('./routes/system/logs/show'));

	/*
	 * System. Tunables.
	 */
	app.get(config.api.prefix + '/system/tunables', require('./routes/system/tunables/index'));
	app.get(config.api.prefix + '/system/tunables/:tunable', require('./routes/system/tunables/show'));
	app.patch(config.api.prefix + '/system/tunables/:tunable', require('./routes/system/tunables/patch'));
	app.delete(config.api.prefix + '/system/tunables/:tunable', require('./routes/system/tunables/delete'));

	/*
	 * Routing. Settings.
	 */
	app.get(config.api.prefix + '/system/settings', require('./routes/system/settings/index'));
	app.get(config.api.prefix + '/system/settings/:setting', require('./routes/system/settings/show'));
	app.patch(config.api.prefix + '/system/settings/:setting', require('./routes/system/settings/patch'));

	/*
	 * Interfaces.
	 */
	app.get(config.api.prefix + '/interfaces', require('./routes/interfaces/index'));

	/*
	 * Interfaces. Ethernets.
	 */
	app.get(config.api.prefix + '/interfaces/ethernets', require('./routes/interfaces/ethernets/index'));
	app.get(config.api.prefix + '/interfaces/ethernets/:ethernet', require('./routes/interfaces/ethernets/show'));
	app.patch(config.api.prefix + '/interfaces/ethernets/:ethernet', require('./routes/interfaces/ethernets/patch'));
	app.delete(config.api.prefix + '/interfaces/ethernets/:ethernet', require('./routes/interfaces/ethernets/delete'));

	/*
	 * Interfaces. Ethernets. Addresses.
	 */
	app.get(config.api.prefix + '/interfaces/ethernets/:ethernet' + '/addresses', require('./routes/interfaces/ethernets/addresses/index'));
	app.post(config.api.prefix + '/interfaces/ethernets/:ethernet' + '/addresses', require('./routes/interfaces/ethernets/addresses/create'));
	app.get(config.api.prefix + '/interfaces/ethernets/:ethernet' + '/addresses/:address', require('./routes/interfaces/ethernets/addresses/show'));
	app.delete(config.api.prefix + '/interfaces/ethernets/:ethernet' + '/addresses/:address', require('./routes/interfaces/addresses/delete'));
	app.patch(config.api.prefix + '/interfaces/ethernets/:ethernet' + '/addresses/:address', require('./routes/interfaces/addresses/patch'));

	/*
	 * Interfaces. Loopbacks.
	 */
	app.get(config.api.prefix + '/interfaces/loopbacks', require('./routes/interfaces/loopbacks/index'));
	app.get(config.api.prefix + '/interfaces/loopbacks/:loopback', require('./routes/interfaces/loopbacks/show'));
	app.patch(config.api.prefix + '/interfaces/loopbacks/:loopback', require('./routes/interfaces/loopbacks/patch'));
	app.delete(config.api.prefix + '/interfaces/loopbacks/:loopback', require('./routes/interfaces/loopbacks/delete'));

	/*
	 * Interfaces. Loopbacks. Addresses.
	 */
	app.get(config.api.prefix + '/interfaces/loopbacks/:loopback' + '/addresses', require('./routes/interfaces/loopbacks/addresses/index'));
	app.post(config.api.prefix + '/interfaces/loopbacks/:loopback' + '/addresses', require('./routes/interfaces/loopbacks/addresses/create'));
	app.get(config.api.prefix + '/interfaces/loopbacks/:loopback' + '/addresses/:address', require('./routes/interfaces/loopbacks/addresses/show'));
	app.delete(config.api.prefix + '/interfaces/loopbacks/:loopback' + '/addresses/:address', require('./routes/interfaces/addresses/delete'));
	app.patch(config.api.prefix + '/interfaces/loopbacks/:loopback' + '/addresses/:address', require('./routes/interfaces/addresses/patch'));

	/*
	 * Interfaces. VLANs.
	 */
	app.get(config.api.prefix + '/interfaces/vlans', require('./routes/interfaces/vlans/index'));
	app.post(config.api.prefix + '/interfaces/vlans', require('./routes/interfaces/vlans/create'));
	app.get(config.api.prefix + '/interfaces/vlans/:vlan', require('./routes/interfaces/vlans/show'));
	app.patch(config.api.prefix + '/interfaces/vlans/:vlan', require('./routes/interfaces/vlans/patch'));
	app.delete(config.api.prefix + '/interfaces/vlans/:vlan', require('./routes/interfaces/vlans/delete'));

	/*
	 * Interfaces. VLANs. Addresses.
	 */
	app.get(config.api.prefix + '/interfaces/vlans/:vlan' + '/addresses', require('./routes/interfaces/vlans/addresses/index'));
	app.post(config.api.prefix + '/interfaces/vlans/:vlan' + '/addresses', require('./routes/interfaces/vlans/addresses/create'));
	app.get(config.api.prefix + '/interfaces/vlans/:vlan' + '/addresses/:address', require('./routes/interfaces/vlans/addresses/show'));
	app.delete(config.api.prefix + '/interfaces/vlans/:vlan' + '/addresses/:address', require('./routes/interfaces/addresses/delete'));
	app.patch(config.api.prefix + '/interfaces/vlans/:vlan' + '/addresses/:address', require('./routes/interfaces/addresses/patch'));

	/*
	 * Routing.
	 */
	app.get(config.api.prefix + '/routing', require('./routes/routing/index'));

	/*
	 * Routing. Settings.
	 */
	app.get(config.api.prefix + '/routing/settings', require('./routes/routing/settings/index'));
	app.get(config.api.prefix + '/routing/settings/:setting', require('./routes/routing/settings/show'));
	app.patch(config.api.prefix + '/routing/settings/:setting', require('./routes/routing/settings/patch'));

	/*
	 * Routing. Static.
	 */
	app.get(config.api.prefix + '/routing/static', require('./routes/routing/static/index'));

	/*
	 * Routing. Static. Tables.
	 */
	app.get(config.api.prefix + '/routing/static/tables', require('./routes/routing/static/tables/index'));
	app.post(config.api.prefix + '/routing/static/tables', require('./routes/routing/static/tables/create'));
	app.get(config.api.prefix + '/routing/static/tables/:table', require('./routes/routing/static/tables/show'));
	app.delete(config.api.prefix + '/routing/static/tables/:table', require('./routes/routing/static/tables/delete'));
	app.patch(config.api.prefix + '/routing/static/tables/:table', require('./routes/routing/static/tables/patch'));

	/*
	 * Routing. Static. Tables. Routes.
	 */
	app.get(config.api.prefix + '/routing/static/tables/:table/routes', require('./routes/routing/static/tables/routes/index'));
	app.post(config.api.prefix + '/routing/static/tables/:table/routes', require('./routes/routing/static/tables/routes/create'));
	app.get(config.api.prefix + '/routing/static/tables/:table/routes/:route', require('./routes/routing/static/tables/routes/show'));
	app.delete(config.api.prefix + '/routing/static/tables/:table/routes/:route', require('./routes/routing/static/routes/delete'));
	app.patch(config.api.prefix + '/routing/static/tables/:table/routes/:route', require('./routes/routing/static/routes/patch'));

	/*
	 * Routing. Static. Rules.
	 */
	app.get(config.api.prefix + '/routing/static/rules', require('./routes/routing/static/rules/index'));
	app.post(config.api.prefix + '/routing/static/rules', require('./routes/routing/static/rules/create'));
	app.get(config.api.prefix + '/routing/static/rules/:rule', require('./routes/routing/static/rules/show'));
	app.delete(config.api.prefix + '/routing/static/rules/:rule', require('./routes/routing/static/rules/delete'));
	app.patch(config.api.prefix + '/routing/static/rules/:rule', require('./routes/routing/static/rules/patch'));
};