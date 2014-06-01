var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');

var settings_patch = require('../../../common/settings/patch');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_errors = {
    errors: []
  };

  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_patch(req, res, {
      cb_patch: cb_patch
    });
  }
  catch (error) {
    res.send(500); // Internal Server Error.
  }
};

/*
 * Function for cross-relationships.
 */
function cb_patch(setting, cb) {
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
          // Update hostname in /proc/sys/kernel/hostname.
          exec('sysctl -w kernel.hostname=' + setting.value, function (error, stdout, stderror) {
            if (error) {
              cb_parallel(stderror.replace(/\n/g, ''));

              return;
            }

            cb_parallel(null);
          });
        }
        // It should be replaced also the /etc/hosts file but this task is cumbersome. Maybe does not worth the effort?
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