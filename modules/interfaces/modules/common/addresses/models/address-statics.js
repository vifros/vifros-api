var async = require('async');

var ip_address = require('iproute').address;

/*
 * Removes all filtered addresses from DB and OS.
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
       * Remove the addresses from OS.
       */
      async.each(docs, function (item, cb_each) {
        // These options are enough to delete an address, and since they are required is safe to use them directly.
        ip_address.delete({
          dev  : item.interface,
          local: item.address
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
           * Delete addresses in DB.
           */
          self.findByIdAndRemove(item._id, function (error) {
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
 * Detects all addresses present in OS and add them all to DB.
 */
exports.createFromOStoDB = function (options, cb) {
  var self = this;

  var filter = {};
  if (options
    && typeof options.filter != 'undefined') {
    filter = options.filter;
  }

  /*
   * Compatibility with iproute attributes.
   */
  if (filter.interface) {
    filter.dev = filter.interface;
  }

  /*
   * Get Device Addresses.
   */
  ip_address.show(filter, function (error, addresses) {
    if (error) {
      cb(error);

      return;
    }

    /*
     * Iterate over the interfaces.
     */
    async.each(Object.keys(addresses), function (iface, cb_each) {
      async.each(addresses[iface], function (item, cb_each_2) {
        /*
         * Compatibilize names before insert them into DB.
         */
        item['interface'] = iface;
        item['broadcast'] = item.brd;

        if (item.type.search('inet') == -1) {
          /*
           * Is not an IP address so continue.
           */
          cb_each_2(null);

          return;
        }

        var address = new self(item);

        /*
         * Save address to database.
         */
        address.save(function (error) {
          if (error) {
            cb_each_2(error);

            return;
          }

          cb_each_2(null);
        });
      }, function (error) {
        if (error) {
          cb_each(error);

          return;
        }

        cb_each(null);
      });
    }, function (error) {
      if (error) {
        cb(error);

        return;
      }

      cb(null);
    });
  });
};

/*
 * Overwrites  OS and add them all to DB.
 */
exports.createFromDBtoOS = function (options, cb) {
  var self = this;

  var filter = {};
  if (options
    && typeof options.filter != 'undefined') {
    filter = options.filter;
  }

  self.find(filter, function (error, docs) {
    if (error) {
      cb(error);

      return;
    }

    if (docs && docs.length) {
      /*
       * Flush all interface addresses.
       */
      ip_address.flush({
        dev: filter.interface
      }, function (error) {
        if (error) {
          cb(error);

          return;
        }

        /*
         * Add addresses into OS.
         */
        async.each(docs, function (item, cb_each) {
          /*
           * Compatibilize attributes with iproute.
           */
          item.dev = item.interface;
          item.local = item.address;

          ip_address.add(item, function (error) {
            if (error) {
              cb_each(error);

              return;
            }

            cb_each(null);
          });
        }, function (error) {
          if (error) {
            cb(error);

            return;
          }

          cb(null);
        });
      });

      return;
    }

    /*
     * Only flush its addresses to maintain the OS in sync with DB.
     */
    ip_address.flush({
      dev: filter.interface
    }, function (error) {
      if (error) {
        cb(error);

        return;
      }

      cb(null);
    });
  });
};