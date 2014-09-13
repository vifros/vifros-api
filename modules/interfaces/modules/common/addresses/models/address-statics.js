var async = require('async');
var Netmask = require('netmask').Netmask

var ip_address = require('iproute').address;
var address_scopes = ip_address.utils.scopes;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

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
            code : 'internal_server_error',
            title: 'Internal Server Error.'
          }
        ]
      });
      return;
    }

    if (!docs.length) {
      cb({
        server_code: 404, // Not found.
        errors     : [
          {
            code : 'not_found',
            title: 'Not found.'
          }
        ]
      });
      return;
    }

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
                code : 'internal_server_error',
                title: 'Internal Server Error.'
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
                  code : 'internal_server_error',
                  title: 'Internal Server Error.'
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

/**
 * Validate a doc to be updated.
 * Returns an errors array suitable for JSON API responses.
 *
 * @param   {object}      object
 * @param   {function}    cb
 */
exports.validate = function validate(object, cb) {
  var errors = [];

  /*
   * address.
   */
  if (object.address) {
    try {
      var netmask_address = new Netmask(object.address);
    }
    catch (e) {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'address',
        title: log_codes.invalid_value.message
      });
    }

    if (object.peer
      && object.address.split('/').length > 1) {

      errors.push({
        code : log_codes.invalid_value.code,
        path : 'address',
        title: log_codes.invalid_value.message + ' Can\'t have a network prefix if "peer" is provided.'
      });
    }
  }

  /*
   * peer.
   */
  if (object.peer) {
    try {
      var netmask_peer = new Netmask(object.peer);
    }
    catch (e) {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'peer',
        title: log_codes.invalid_value.message
      });
    }
  }

  /*
   * broadcast.
   */
  if (object.broadcast
    && object.broadcast != '+'
    && object.broadcast != '-') {

    try {
      var netmask_broadcast = new Netmask(object.broadcast);
    }
    catch (e) {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'broadcast',
        title: log_codes.invalid_value.message
      });
    }
  }

  /*
   * scope.
   */
  if (object.scope
    && !address_scopes.hasOwnProperty(object.scope)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'scope',
      title: log_codes.invalid_value.message
    });
  }

  cb(null, errors);
};