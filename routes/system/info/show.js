var os = require('os');
var fs = require('fs');
var exec = require('child_process').exec;

var config = require('../../../config');

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_body = {
		links: {
			info: req.protocol + '://' + req.get('Host') + config.api.prefix + '/system/info/{info.name}'
		},
		info : []
	};

	var json_api_errors = {
		errors: []
	};

	var buffer = {
		name : req.params.info,
		value: null
	};

	switch (req.params.info) {
		case 'time':
			buffer.value = {
				up     : os.uptime(),
				current: (new Date()).getTime()
			};

			json_api_body.info.push(buffer);

			res.json(200, json_api_body); // OK.

			break;

		case 'os':
			buffer.value = {
				type    : os.type(),
				arch    : os.arch(),
				release : os.release(),
				platform: os.platform()
			};

			json_api_body.info.push(buffer);

			res.json(200, json_api_body); // OK.

			break;

		case 'memory':
			buffer.value = {
				installed: os.totalmem(),
				usage    : Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
			};

			json_api_body.info.push(buffer);

			res.json(200, json_api_body); // OK.

			break;

		case 'load':
			buffer.value = os.loadavg();

			json_api_body.info.push(buffer);

			res.json(200, json_api_body); // OK.

			break;

		case 'cpus':
			var cpus = os.cpus();
			var json_cpus = [];

			for (var core = 0, j = cpus.length;
			     core < j;
			     core++) {

				var total_load = cpus[core].times.user + cpus[core].times.nice + cpus[core].times.sys + cpus[core].times.idle + cpus[core].times.irq;
				var cpu_usage = Math.floor(((total_load - cpus[core].times.idle) / total_load) * 100);

				if (json_cpus.length) {
					for (var cpu = 0, k = cpus.length;
					     cpu < k;
					     cpu++) {

						if (json_cpus[cpu].model == cpus[core].model) {
							json_cpus[cpu].quantity++;
						}
						else {
							json_cpus.push({
								model   : cpus[core].model,
								quantity: 1,
								usage   : cpu_usage
							});
						}
					}
				}
				else {
					json_cpus.push({
						model   : cpus[core].model,
						quantity: 1,
						usage   : cpu_usage
					});
				}
			}

			buffer.value = json_cpus;

			json_api_body.info.push(buffer);

			res.json(200, json_api_body); // OK.


			break;

		case 'swap':
			fs.readFile('/proc/swaps', {
				encoding: 'utf8'
			}, function (error, file_content) {
				if (error) {
					logger.error(error, {
						module: 'system/info',
						tags  : [
							log_tags.api_request
						]
					});

					json_api_errors.errors.push({
						code   : '',
						field  : '',
						message: error
					});

					res.json(500, json_api_errors); // Internal Server Error.
				}
				else {
					var proc_swap = file_content.split('\n')[1].split('\t');

					buffer.value = {
						installed: proc_swap[1],
						usage    : Math.floor((proc_swap[2] / proc_swap[1]) * 100)
					};

					json_api_body.info.push(buffer);

					res.json(200, json_api_body); // OK.
				}
			});

			break;

		case 'disks':
			exec("df | awk '{print  $1\"\t\"$2\"\t\"$5\"\t\"$6}'", function (error, stdout, stderror) {
				if (error) {
					logger.error(error, {
						module: 'system/info',
						tags  : [
							log_tags.api_request
						]
					});

					json_api_errors.errors.push({
						code   : '',
						field  : '',
						message: error
					});

					res.json(500, json_api_errors); // Internal Server Error.
				}
				else {
					var disks = stdout.split('\n');
					var json_disks = [];

					// Build object with usable Disks data.
					for (var line = 0, j = disks.length;
					     line < j;
					     line++) {

						if (disks[line].split('\t')[0].search('/dev/') != '-1') {
							/*
							 * Is a valid disk device.
							 */
							json_disks.push({
								installed: disks[line].split('\t')[1],
								usage    : disks[line].split('\t')[2].split('%')[0],
								device   : disks[line].split('\t')[0],
								path     : disks[line].split('\t')[3]
							});
						}
					}

					buffer.value = json_disks;

					json_api_body.info.push(buffer);

					res.json(200, json_api_body); // OK.
				}
			});

			break;

		default:
			res.json(404, json_api_body); // Not found.

			break;
	}
};