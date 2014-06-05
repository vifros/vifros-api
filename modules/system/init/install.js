var os = require('os');
var fs = require('fs');
var async = require('async');

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../common/settings/models/setting').Setting;
var setting_statuses = require('../../common/settings/models/setting').statuses;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
   */
  // Overwrites OS settings with DB ones.
  async.parallel([
    function (cb_parallel) {
      /*
       * Setting: Domain and nameservers.
       */
      fs.readFile('/etc/resolv.conf', {
        encoding: 'utf8'
      }, function (error, file_content) {
        if (error) {
          cb_parallel(error);

          return;
        }

        var resolv_conf = file_content.split('\n');

        var domain = '';
        var nameservers = [];

        // Parse lines in resolv.conf file to obtain domain and nameservers.
        for (var i = 0, j = resolv_conf.length;
             i < j;
             i++) {

          // Search for system domain.
          if (resolv_conf[i].search(/search/g) != -1) {
            domain = resolv_conf[i].split('search ')[1];
          }

          // Search for nameservers
          if (resolv_conf[i].search(/nameserver/g) != -1) {
            nameservers.push(resolv_conf[i].split('nameserver ')[1]);
          }
        }

        cb_parallel(null, {
          domain     : domain,
          nameservers: nameservers
        });
      });
    }
  ],
    function (error, results) {
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

      var settings = [];

      var status = new Setting({
        module: 'system/settings',
        name  : 'status',
        value : setting_statuses.enabled
      });
      settings.push(status);

      var hostname = new Setting({
        module: 'system/settings',
        name  : 'hostname',
        value : os.hostname()
      });
      settings.push(hostname);

      var domain = new Setting({
        module: 'system/settings',
        name  : 'domain',
        value : results[0].domain
      });
      settings.push(domain);

      var nameservers = new Setting({
        module: 'system/settings',
        name  : 'nameservers',
        value : results[0].nameservers
      });
      settings.push(nameservers);

      async.each(settings, function (item, cb_each) {
        item.save(function (error) {
          if (error) {
            cb_each(error);

            return;
          }

          cb_each(null);
        });
      }, function (error) {
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
    });
};