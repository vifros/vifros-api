var async = require('async');
var validator = require('validator');
var Netmask = require('netmask').Netmask;

var ip_link = require('iproute').link;
var ip_route = require('iproute').route;
var ip_address = require('iproute').address;
var route_types = ip_route.utils.types;
var address_scopes = ip_address.utils.scopes;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var StaticRoutingTable = require('../models/table').StaticRoutingTable;

/*
 * Removes all filtered routes from DB and OS.
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
     * Remove the route from OS.
     */
    async.each(docs, function (item, cb_each) {
      ip_route.delete(item, function (error) {
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
         * Delete routes in DB.
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

/**
 * Validate a route doc.
 * Returns an errors array suitable for JSON API responses.
 *
 * @param   {object}      object
 * @param   {function}    cb
 */
exports.validate = function validate(object, cb) {
  var errors = [];

  /*
   * to.
   */
  if (object.to) {
    try {
      var netmask_to = new Netmask(object.to);
    }
    catch (e) {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'to',
        title: log_codes.invalid_value.message
      });
    }
  }

  /*
   * type.
   */
  if (object.type
    && !route_types.hasOwnProperty(object.type)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'type',
      title: log_codes.invalid_value.message
    });
  }

  /*
   * preference.
   */
  if (object.preference
    && (object.preference < 0 || object.preference > 4294967296)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'preference',
      title: log_codes.invalid_value.message
    });
  }

  /*
   * via.
   */
  if (object.via
    && !validator.isIP(object.via)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'via',
      title: log_codes.invalid_value.message
    });
  }

  /*
   * src.
   */
  if (object.src
    && !validator.isIP(object.src)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'src',
      title: log_codes.invalid_value.message
    });
  }

  /*
   * mtu.
   */
  if (object.mtu) {
    if (object.mtu.split('lock ').length == 2
      && Number(object.mtu.split('lock ')[1]) < 0) {

      errors.push({
        code : log_codes.invalid_value.code,
        path : 'mtu',
        title: log_codes.invalid_value.message
      });
    }
    else if (object.mtu.split('lock ').length == 1
      && Number(object.mtu) < 0) {

      errors.push({
        code : log_codes.invalid_value.code,
        path : 'mtu',
        title: log_codes.invalid_value.message
      });
    }
    else {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'mtu',
        title: log_codes.invalid_value.message
      });
    }
  }

  /*
   * nexthop.
   */
  if (object.nexthop) {
    if (!object.nexthop instanceof Array) {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'nexthop',
        title: log_codes.invalid_value.message
      });
    }

    for (var i = 0, j = object.nexthop.length;
         i < j;
         i++) {

      if (object.nexthop[i].via
        && !validator.isIP(object.nexthop[i].via)) {

        errors.push({
          code : log_codes.invalid_value.code,
          path : 'nexthop',
          title: log_codes.invalid_value.message
        });
        break;
      }
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

  /*
   * onlink.
   */
  if (object.onlink
    && !object.nexthop) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'onlink',
      title: log_codes.invalid_value.message
    });
  }

  async.parallel([
    function (cb_parallel) {
      /*
       * table.
       */
      if (object.table) {
        StaticRoutingTable.findOne({
          id: object.table
        }, function (error, doc) {
          if (error) {
            cb_parallel(error);
            return;
          }

          if (!doc) {
            errors.push({
              code : log_codes.related_resource_not_found.code,
              path : 'table',
              title: log_codes.related_resource_not_found.message.replace('%s', 'table')
            });

            cb_parallel(null);
            return;
          }

          cb_parallel(null);
        });
        return;
      }

      cb_parallel(null);
    },
    function (cb_parallel) {
      /*
       * dev.
       */
      if (object.dev) {
        ip_link.show({
          dev: object.dev
        }, function (error, links) {
          if (error) {
            cb_parallel(error);
            return;
          }

          if (!links) {
            errors.push({
              code : log_codes.related_resource_not_found.code,
              path : 'dev',
              title: log_codes.related_resource_not_found.message.replace('%s', 'dev')
            });

            cb_parallel(null);
            return;
          }
          cb_parallel(null);
        });
        return;
      }

      cb_parallel(null);
    }
  ], function (error) {
    if (error) {
      cb(error);
      return;
    }

    cb(null, errors);
  });
};