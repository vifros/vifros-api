var async = require('async');

var ip_link = require('iproute').link;
var link_types = ip_link.utils.types;
var link_statuses = ip_link.utils.statuses;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var Setting = require('../../../../common/settings/models/setting').Setting;
var setting_statuses = require('../../../../common/settings/models/setting').statuses;

var Address = require('../../common/addresses/models/address').Address;
var Ethernet = require('../models/ethernet').Ethernet;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
   */
  // Get the data for the currently list of installed devices.
  ip_link.show(function (error, links) {
    if (error) {
      logger.error(error, {
        module: 'interfaces/ethernets',
        tags  : [
          log_tags.init,
          log_tags.os
        ]
      });

      cb_init(error);
      return;
    }

    async.each(links, function (item, cb_each) {
      if (item.type != link_types.ethernet
        || item.hasOwnProperty('vl_type')) { // Due virtual links specifics they are handled on they own modules.

        cb_each(null);
        return;
      }

      /*
       * Is a valid device so process it.
       *
       * Compatibilize fields.
       */
      item.status = {
        operational: item.state,
        admin      : (item.state == link_statuses.UP || item.state == link_statuses.DOWN)
          ? item.state
          : link_statuses.UP
      };

      var ethernet = new Ethernet(item);

      /*
       * Save it to DB.
       */
      ethernet.save(function (error) {
        if (error) {
          cb_each(error);
          return;
        }

        /*
         * Detect OS addresses and insert them to DB.
         */
        Address.createFromOStoDB({
          filter: {
            interface: item.name
          }
        }, function (error) {
          if (error) {
            cb_each(error);
            return;
          }

          cb_each(error);
        });
      });
    }, function (error) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/ethernets',
          tags  : [
            log_tags.init
          ]
        });

        cb_init(error);
        return;
      }

      var setting = new Setting({
        module: 'interfaces/ethernets',
        name  : 'status',
        value : setting_statuses.enabled
      });

      setting.save(function (error) {
        if (error) {
          logger.error(error, {
            module: 'interfaces/ethernets',
            tags  : [
              log_tags.init,
              log_tags.db
            ]
          });

          cb_init(error);
          return;
        }

        logger.info('Module started.', {
          module: 'interfaces/ethernets',
          tags  : [
            log_tags.init
          ]
        });

        cb_init(null);
      });
    });
  });
};