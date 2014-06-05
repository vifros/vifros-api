var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../common/settings/models/setting').Setting;

module.exports = function (cb_init) {
  /*
   * Already initialized.
   */
  // Overwrites OS settings with DB ones.
  async.parallel([
    function (cb_parallel) {
      Setting.findOne({
        module: 'system/settings',
        name  : 'hostname'
      }, function (error, doc) {
        if (error) {
          cb_parallel(error);

          return;
        }

        async.parallel([
          function (cb_parallel_inner) {
            // Update hostname in /etc/hostname.
            fs.writeFile('/etc/hostname', doc.value + '\n', function (error) {
              if (error) {
                cb_parallel_inner(error);

                return;
              }

              cb_parallel_inner(null);
            });
          },
          function (cb_parallel_inner) {
            // Update hostname in /proc/sys/kernel/hostname.
            exec('sysctl -w kernel.hostname=' + doc.value, function (error, stdout, stderror) {
              if (error) {
                cb_parallel_inner(stderror.replace(/\n/g, ''));

                return;
              }

              cb_parallel_inner(null);
            });
          }
          // It should be replaced also the /etc/hosts file but this task is cumbersome. Maybe does not worth the effort?
        ], function (error) {
          if (error) {
            cb_parallel(error);

            return;
          }

          cb_parallel(null);
        });
      });
    },
    function (cb_parallel) {
      async.parallel([
        /*
         * Search the domain.
         */
        function (cb_parallel_inner) {
          Setting.findOne({
            module: 'system/settings',
            name  : 'domain'
          }, function (error, doc) {
            if (error) {
              cb_parallel_inner(error);

              return;
            }

            cb_parallel_inner(null, doc.value);
          });
        },
        /*
         * Search the nameservers.
         */
        function (cb_parallel_inner) {
          Setting.findOne({
            module: 'system/settings',
            name  : 'nameservers'
          }, function (error, doc) {
            if (error) {
              cb_parallel_inner(error);

              return;
            }

            cb_parallel_inner(null, doc.value);
          });
        }
      ], function (error, results) {
        if (error) {
          cb_parallel(error);

          return;
        }

        var domain = results[0];
        var nameservers = results[1];

        async.parallel([
          function (cb_parallel_inner) {
            if (!domain) {
              cb_parallel_inner(null);

              return;
            }

            // Update domain in/proc/sys/kernel/domainname.
            exec('sysctl -w kernel.domainname=' + domain, function (error, stdout, stderror) {
              if (error) {
                cb_parallel_inner(stderror.replace(/\n/g, ''));

                return;
              }

              cb_parallel_inner(null);
            });
          },
          function (cb_parallel_inner) {
            /*
             * Update domain and nameservers for its use by resolv.conf.
             */
            var resolv_conf_body = '';

            if (domain) {
              resolv_conf_body += 'search ' + domain;
            }

            for (var i = 0, j = nameservers.length;
                 i < j;
                 i++) {

              resolv_conf_body += '\nnameserver ' + nameservers[i];
            }

            // Update config in /etc/resolvconf/resolv.conf.d/base.
            fs.writeFile('/etc/resolvconf/resolv.conf.d/base', resolv_conf_body, function (error) {
              if (error) {
                cb_parallel_inner(error);

                return;
              }

              /*
               * Trigger a resolv.conf update to regenerate the resolv.conf file.
               */
              exec('resolvconf -u', function (error, stdout, stderror) {
                if (error) {
                  cb_parallel_inner(stderror.replace(/\n/g, ''));

                  return;
                }

                cb_parallel_inner(null);
              });
            });
          }
        ], function (error) {
          if (error) {
            cb_parallel(error);

            return;
          }

          cb_parallel(null);
        });
      });
    }
  ], function (error) {
    if (error) {
      logger.error(error, {
        module: 'system/settings',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(error);

      return;
    }

    logger.info('Module started.', {
      module: 'system/settings',
      tags  : [
        log_tags.init
      ]
    });

    cb_init(null);
  });
};