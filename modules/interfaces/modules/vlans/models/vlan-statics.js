var async = require('async');

var iproute = require('iproute');
var ip_link = iproute.link;
var link_vl_types = ip_link.utils.vl_types;
var link_statuses = ip_link.utils.statuses;

var ip_monitor = iproute.monitor();

var Address = require('../../common/addresses/models/address').Address;

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

/*
 * Removes all filtered VLANs from DB and OS.
 */
exports.purgeFromOSandDB = function (options, cb) {
  var self = this;

  this.find(options.filter, function (error, docs) {
    if (error) {
      cb({
        server_code: 500, // Internal Server Error.
        errors     : [
          {
            code   : error.name,
            field  : '',
            message: error.message
          }
        ]
      });

      return;
    }

    if (docs && docs.length) {
      /*
       * Remove the VLANs from OS.
       */
      async.each(docs, function (item, cb_each) {
        /*
         * Check if they are present in OS or not.
         */
        if (item.status.operational == link_statuses.NOTPRESENT) {
          /*
           * Only remove it from DB and its related addresses.
           */
          item.remove(function (error) {
            if (error) {
              cb_each({
                server_code: 500, // Internal Server Error.
                errors     : [
                  {
                    code   : '',
                    field  : '',
                    message: error.message
                  }
                ]
              });

              return;
            }

            /*
             * Delete associated addresses in DB.
             * There is no need to delete them from OS since it is automatically done.
             */
            Address.remove({
              interface: item.interface + '.' + item.tag
            }, function (error) {
              if (error) {
                cb_each({
                  server_code: 500, // Internal Server Error.
                  errors     : [
                    {
                      code   : error.name,
                      field  : '',
                      message: error.message
                    }
                  ]
                });

                return;
              }

              cb_each(null);
            });
          });

          return;
        }

        /*
         * Is present in OS.
         */
        ip_link.delete({
          // These options are enough to delete the interface and since they are required is safe to use them directly.
          dev: item.interface + '.' + item.tag
        }, function (error) {
          if (error) {
            cb_each({
              server_code: 500, // Internal Server Error.
              errors     : [
                {
                  code   : 'iproute',
                  field  : '',
                  message: error
                }
              ]
            });

            return;
          }

          /*
           * Delete the VLAN in DB.
           */
          item.remove(function (error) {
            if (error) {
              cb_each({
                server_code: 500, // Internal Server Error.
                errors     : [
                  {
                    code   : error.name,
                    field  : '',
                    message: error.message
                  }
                ]
              });

              return;
            }

            /*
             * Delete associated addresses in DB.
             * There is no need to delete them from OS since it is automatically done.
             */
            Address.remove({
              interface: item.interface + '.' + item.tag
            }, function (error) {
              if (error) {
                cb_each({
                  server_code: 500, // Internal Server Error.
                  errors     : [
                    {
                      code   : error.name,
                      field  : '',
                      message: error.message
                    }
                  ]
                });

                return;
              }

              cb_each(null);
            });
          });
        });
      }, function (error) {
        if (error) {
          cb(error);

          return;
        }

        cb(null, {
          server_code: 204 // No Content.
        });
      });

      return;
    }

    cb(null, {
      server_code: 404 // Not found.
    });
  });
};

/*
 * Adds a monitor to update the operational state of devices.
 */
exports.setMonitor = function (cb) {
  var self = this;

  ip_monitor.on('error', function (error) {
    logger.error(error, {
      module: 'interfaces/vlans',
      tags  : [
        log_tags.os
      ]
    });
  });

  ip_monitor.on('link', function (data) {
      var link = data.data[0];

      if (link.hasOwnProperty('vl_type')
        || link.vl_type == link_vl_types.vlan) {

        // Is a VLAN and has a valid state so update it.
        self.findOne({
            interface: link.name.split('.')[0],
            tag      : link.name.split('.')[1]
          },
          function (error, doc) {
            if (doc) {
              doc.status.operational = link.state;

              doc.save(function (error) {
                if (error) {
                  logger.error(error, {
                    module: 'interfaces/vlans',
                    tags  : [
                      log_tags.os
                    ]
                  });
                }
              });
            }
          }
        );
      }
    }
  );

  cb(null);
};