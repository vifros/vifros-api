var iproute = require('iproute');
var link_types = iproute.link.utils.types;
var ip_monitor = iproute.monitor();

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

/*
 * Adds a monitor to update the operational state of devices.
 */
exports.setMonitor = function (cb) {
  var self = this;

  ip_monitor.on('error', function (error) {
    logger.error(error, {
      module: 'interfaces/loopbacks',
      tags  : [
        log_tags.os
      ]
    });
  });

  ip_monitor.on('link', function (data) {
    var link = data.data[0];

    if (link.type == link_types.loopback
      && link.state) {

      // Is a loopback and has a valid state so update it.
      self.findOne({
        name: link.name
      }, function (error, doc) {
        if (doc) {
          doc.status.operational = link.state;

          doc.save(function (error) {
            if (error) {
              logger.error(error, {
                module: 'interfaces/loopbacks',
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

/**
 * Validate an loopback doc to be updated.
 * Returns an errors array suitable for JSON API responses.
 *
 * @param   {object}      object
 * @param   {function}    cb
 */
exports.validate = function validate(object, cb) {
  var errors = [];

  if (object.status
    && object.status.admin
    && (object.status.admin.toLowerCase() != 'up'
    && object.status.admin.toLowerCase() != 'down')) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'status.admin',
      title: log_codes.invalid_value.message
    });
  }

  if (object.mac
    && !(/^([0-9a-f]{2}([:-]|$)){6}$/i.test(object.mac))) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'mac',
      title: log_codes.invalid_value.message
    });
  }

  if (object.mtu
    && object.mtu < 0) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'mtu',
      title: log_codes.invalid_value.message
    });
  }

  cb(null, errors);
};