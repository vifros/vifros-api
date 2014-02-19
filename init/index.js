var async = require('async');

module.exports = function (cb_init) {
	var init = [];

	// Interfaces. Loopbacks.
	init.push(require('./interfaces/loopbacks/index'));

	// Interfaces. Ethernets.
	init.push(require('./interfaces/ethernets/index'));

	// Interfaces. VLANs.
	init.push(require('./interfaces/vlans/index'));

	// Routing.
	init.push(require('./routing/index'));

	// Routing. Static. Tables.
	init.push(require('./routing/static/tables/index'));

	// Routing. Static. Routes.
	init.push(require('./routing/static/routes/index'));

	// Routing. Static. Rules.
	init.push(require('./routing/static/rules/index'));

	async.eachSeries(init, function (item, cb_each) {
		item(cb_each);
	}, function (error) {
		if (error) {
			cb_init(error);
		}
		else {
			cb_init(null);
		}
	});
};