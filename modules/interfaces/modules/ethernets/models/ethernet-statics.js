var iproute = require('iproute');
var link_types = iproute.link.utils.types;
var ip_monitor = iproute.monitor();

var logger = global.vifros.logger;
var log_tags = logger.tags;

/*
 * Adds a monitor to update the operational state of devices.
 */
exports.setMonitor = function (cb) {
  var self = this;

  ip_monitor.on('error', function (error) {
    logger.error(error, {
      module: 'interfaces/ethernets',
      tags  : [
        log_tags.os
      ]
    });
  });

  ip_monitor.on('link', function (data) {
    var link = data.data[0];

    if (link.type == link_types.ethernet
      && link.state) {

      // Is an ethernet and has a valid state so update it.
      self.findOne({
        name: link.name
      }, function (error, doc) {
        if (doc) {
          doc.status.operational = link.state;

          doc.save(function (error) {
            if (error) {
              logger.error(error, {
                module: 'interfaces/ethernets',
                tags  : [
                  log_tags.os
                ]
              });
            }
          });
        }
      });
    }
  });

  cb(null);
};