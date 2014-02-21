var os = require('os');
var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');

var config = require('../../../config');

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_body = {
		info: [
			{
				time  : {
					up     : os.uptime(),
					current: (new Date()).getTime()
				},
				os    : {
					type    : os.type(),
					arch    : os.arch(),
					release : os.release(),
					platform: os.platform()
				},
				memory: {
					installed: os.totalmem(),
					usage    : Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
				},
				swap  : {},
				cpus  : [],
				load  : os.loadavg(),
				disks : []
			}
		]
	};

	var json_api_errors = {
		errors: []
	};

	async.parallel([
		function (cb_parallel) {
			/*
			 * CPUs.
			 */
			var cpus = os.cpus();

			for (var core = 0, j = cpus.length;
			     core < j;
			     core++) {

				var total_load = cpus[core].times.user + cpus[core].times.nice + cpus[core].times.sys + cpus[core].times.idle + cpus[core].times.irq;
				var cpu_usage = Math.floor(((total_load - cpus[core].times.idle) / total_load) * 100);

				if (json_api_body.info[0].cpus.length) {
					for (var cpu = 0, k = cpus.length;
					     cpu < k;
					     cpu++) {

						if (json_api_body.info[0].cpus[cpu].model == cpus[core].model) {
							json_api_body.info[0].cpus[cpu].quantity++;
						}
						else {
							json_api_body.info[0].cpus.push({
								model   : cpus[core].model,
								quantity: 1,
								usage   : cpu_usage
							});
						}
					}
				}
				else {
					json_api_body.info[0].cpus.push({
						model   : cpus[core].model,
						quantity: 1,
						usage   : cpu_usage
					});
				}
			}

			cb_parallel(null);
		},
		function (cb_parallel) {
			/*
			 * SWAP.
			 */
			fs.readFile('/proc/swaps', {
				encoding: 'utf8'
			}, function (error, file_content) {
				if (error) {
					cb_parallel(error);
				}
				else {
					var proc_swap = file_content.split('\n')[1].split('\t');

					json_api_body.info[0].swap = {
						installed: proc_swap[1],
						usage    : Math.floor((proc_swap[2] / proc_swap[1]) * 100)
					};

					cb_parallel(null);
				}
			});
		},
		function (cb_parallel) {
			/*
			 * Disks.
			 */
			exec("df | awk '{print  $1\"\t\"$2\"\t\"$5\"\t\"$6}'", function (error, stdout, stderror) {
				if (error) {
					cb_parallel(stderror.replace(/\n/g, ''));
				}
				else {
					var disks = stdout.split('\n');

					// Build object with usable Disks data.
					for (var line = 0, j = disks.length;
					     line < j;
					     line++) {

						if (disks[line].split('\t')[0].search('/dev/') != '-1') {
							/*
							 * Is a valid disk device.
							 */
							json_api_body.info[0].disks.push({
								installed: disks[line].split('\t')[1],
								usage    : disks[line].split('\t')[2].split('%')[0],
								device   : disks[line].split('\t')[0],
								path     : disks[line].split('\t')[3]
							});
						}
					}

					cb_parallel(null);
				}
			});
		}
	], function (error) {
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
				res.json(200, json_api_body); // OK.
			}
		}
	);
};