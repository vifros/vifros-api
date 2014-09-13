var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');
var validator = require('validator');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var settings_update = require('../../../common/settings/routes/update');

module.exports = function (req, res) {
  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_update(req, res, {
      cb_update  : cb_update,
      cb_validate: cb_validate
    });
  }
  catch (error) {
    logger.error(error, {
      module: 'system/settings',
      tags  : [
        log_tags.api_request
      ]
    });

    res.json(500, {
      errors: [
        {
          code : 'internal_server_error',
          title: 'Internal Server Error.'
        }
      ]
    }); // Internal Server Error.
  }
};

/*
 * Function for cross-relationships.
 */
function cb_update(setting, cb) {
  if (typeof arguments[0] != 'object'
    || typeof arguments[1] != 'function') {

    throw new Error('Invalid arguments. Signature: (setting, callback)');
  }

  switch (setting.name) {
    case 'hostname':
      async.parallel([
        function (cb_parallel) {
          // Update hostname in /etc/hostname.
          fs.writeFile('/etc/hostname', setting.value + '\n', function (error) {
            if (error) {
              cb_parallel(error);
              return;
            }

            cb_parallel(null);
          });
        },
        function (cb_parallel) {
          /*
           * This command updates the hostname in /proc/sys/kernel/hostname and in
           * other places needed by the kernel, but only lasts until the next reboot.
           */
          exec('hostname ' + setting.value, function (error, stdout, stderror) {
            if (error) {
              cb_parallel(stderror.replace(/\n/g, ''));
              return;
            }

            cb_parallel(null);
          });
        }
        // TODO: It should be replaced also the /etc/hosts file but this task is cumbersome.
      ], function (error) {
        if (error) {
          cb(error);
          return;
        }

        cb(null);
      });
      break;

    case 'domain':
      async.parallel([
        function (cb_parallel) {
          // Update domain in/proc/sys/kernel/domainname.
          exec('sysctl -w kernel.domainname=' + setting.value, function (error, stdout, stderror) {
            if (error) {
              cb_parallel(stderror.replace(/\n/g, ''));
              return;
            }

            cb_parallel(null);
          });
        },
        function (cb_parallel) {
          /*
           * Update domain and nameservers for its use by resolv.conf.
           */
          fs.readFile('/etc/resolvconf/resolv.conf.d/base', {
            encoding: 'utf8'
          }, function (error, file_content) {
            if (error) {
              cb_parallel(error);
              return;
            }

            var resolv_conf = file_content.split('\n');
            var new_resolv_conf = '';

            // Strip any domain information.
            for (var i = 0, j = resolv_conf.length;
                 i < j;
                 i++) {

              // Search for system domain.
              if (resolv_conf[i].search(/search/g) != -1) {
                continue;
              }

              new_resolv_conf += resolv_conf[i] + '\n';
            }

            // Add the new domain to the file.
            new_resolv_conf += 'search ' + setting.value;

            // Update config in /etc/resolvconf/resolv.conf.d/base.
            fs.writeFile('/etc/resolvconf/resolv.conf.d/base', new_resolv_conf, function (error) {
              if (error) {
                cb_parallel(error);
                return;
              }

              /*
               * Trigger a resolv.conf update to regenerate the resolv.conf file.
               */
              exec('resolvconf -u', function (error, stdout, stderror) {
                if (error) {
                  cb_parallel(stderror.replace(/\n/g, ''));
                  return;
                }

                cb_parallel(null);
              });
            });
          });
        }
      ], function (error) {
        if (error) {
          cb(error);
          return;
        }

        cb(null);
      });
      break;

    case 'nameservers':
      /*
       * Update domain and nameservers for its use by resolv.conf.
       */
      fs.readFile('/etc/resolvconf/resolv.conf.d/base', {
        encoding: 'utf8'
      }, function (error, file_content) {
        if (error) {
          cb(error);
          return;
        }

        var resolv_conf = file_content.split('\n');
        var new_resolv_conf = '';

        // Strip any domain information.
        for (var i = 0, j = resolv_conf.length;
             i < j;
             i++) {

          // Search for system nameservers.
          if (resolv_conf[i].search(/nameserver/g) != -1) {
            continue;
          }

          new_resolv_conf += resolv_conf[i] + '\n';
        }

        // Add the new domain to the file.
        for (var i = 0, j = setting.value.length;
             i < j;
             i++) {

          new_resolv_conf += '\nnameserver ' + setting.value[i];
        }

        // Update config in /etc/resolvconf/resolv.conf.d/base.
        fs.writeFile('/etc/resolvconf/resolv.conf.d/base', new_resolv_conf, function (error) {
          if (error) {
            cb(error);
            return;
          }

          /*
           * Trigger a resolv.conf update to regenerate the resolv.conf file.
           */
          exec('resolvconf -u', function (error, stdout, stderror) {
            if (error) {
              cb(stderror.replace(/\n/g, ''));
              return;
            }

            cb(null);
          });
        });
      });
      break;

    default:
      cb(null);
      break;
  }
}

/*
 * Function for settings validation.
 */
function cb_validate(object, cb) {
  var errors = [];

  /*
   * nameservers.
   */
  if (object.name == 'nameservers') {
    if (!object.value instanceof Array) {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'nameservers',
        title: log_codes.invalid_value.message
      });
    }

    for (var i = 0, j = object.value.length;
         i < j;
         i++) {

      if (!validator.isIP(object.value[i])) {
        errors.push({
          code : log_codes.invalid_value.code,
          path : 'nameservers',
          title: log_codes.invalid_value.message
        });
        break;
      }
    }
  }

  /*
   * hostname.
   */
  if (object.name == 'hostname'
    && !validator.isFQDN(object.value, {
    require_tld: false
  })) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'hostname',
      title: log_codes.invalid_value.message
    });
  }

  /*
   * domain.
   */
  if (object.name == 'domain'
    && !validator.isFQDN(object.value)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'domain',
      title: log_codes.invalid_value.message
    });
  }

  if (errors.length) {
    cb(errors);
  }
  else {
    cb(null);
  }
}