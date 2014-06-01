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
    links: {
      info: req.protocol + '://' + req.get('Host') + config.api.prefix + '/system/info/{info.name}'
    },
    info : [
      {
        name : 'time',
        value: {
          up     : os.uptime(),
          current: (new Date()).getTime()
        }
      },
      {
        name : 'os',
        value: {
          type    : os.type(),
          arch    : os.arch(),
          release : os.release(),
          platform: os.platform()
        }
      },
      {
        name : 'memory',
        value: {
          installed: os.totalmem(),
          usage    : Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
        }
      },
      {
        name : 'load',
        value: os.loadavg()
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
      var json_cpus = [];

      for (var core = 0, j = cpus.length;
           core < j;
           core++) {

        var total_load = cpus[core].times.user + cpus[core].times.nice + cpus[core].times.sys + cpus[core].times.idle + cpus[core].times.irq;
        var cpu_usage = Math.floor(((total_load - cpus[core].times.idle) / total_load) * 100);

        json_cpus.push({
          model: cpus[core].model,
          speed: cpus[core].speed,
          usage: cpu_usage
        });
      }

      json_api_body.info.push({
        name : 'cpus',
        value: json_cpus
      });

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

          return;
        }

        var proc_swap = file_content.split('\n')[1].split('\t');

        json_api_body.info.push({
          name : 'swap',
          value: {
            installed: proc_swap[1],
            usage    : Math.floor((proc_swap[2] / proc_swap[1]) * 100)
          }
        });

        cb_parallel(null);
      });
    },
    function (cb_parallel) {
      /*
       * Disks.
       */
      exec("df | awk '{print  $1\"\t\"$2\"\t\"$5\"\t\"$6}'", function (error, stdout, stderror) {
        if (error) {
          cb_parallel(stderror.replace(/\n/g, ''));

          return;
        }

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

        json_api_body.info.push({
          name : 'disks',
          value: json_disks
        });

        cb_parallel(null);
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

        res.send(500); // Internal Server Error.

        return;
      }

      res.json(200, json_api_body); // OK.
    }
  );
};