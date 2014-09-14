var async = require('async');
var Netmask = require('netmask').Netmask;

var ip_link = require('iproute').link;
var ip_rule = require('iproute').rule;
var rule_types = ip_rule.utils.types;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var StaticRoutingTable = require('../models/table').StaticRoutingTable;

/*
 * Removes all filtered rules from DB and OS.
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
     * Remove the rule from OS.
     */
    async.each(docs, function (item, cb_each) {
      if (item.priority == '0') {
        cb_each({
          server_code: 403, // Forbidden.
          errors     : [
            {
              code : 'readonly_field',
              title: 'The rule is readonly and can not be deleted.'
            }
          ]
        });
        return;
      }

      /*
       * Remove the rule from OS.
       */
      ip_rule.delete(item, function (error) {
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
         * Delete rule in DB.
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
 * Validate a rule doc.
 * Returns an errors array suitable for JSON API responses.
 *
 * @param   {object}      object
 * @param   {function}    cb
 */
exports.validate = function validate(object, cb) {
  var errors = [];

  /*
   * type.
   */
  if (object.type
    && !rule_types.hasOwnProperty(object.type)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'type',
      title: log_codes.invalid_value.message
    });
  }

  /*
   * priority.
   */
  if (object.priority
    && (object.priority < 0 || object.priority > 32767)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'priority',
      title: log_codes.invalid_value.message
    });
  }

  /*
   * from.
   */
  if (object.from) {
    try {
      var netmask_from = new Netmask(object.from);
    }
    catch (e) {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'from',
        title: log_codes.invalid_value.message
      });
    }
  }

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
   * nat.
   */
  if (object.nat) {
    try {
      var netmask_nat = new Netmask(object.nat);
    }
    catch (e) {
      errors.push({
        code : log_codes.invalid_value.code,
        path : 'nat',
        title: log_codes.invalid_value.message
      });
    }
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
       * iif.
       */
      if (object.iif) {
        ip_link.show({
          dev: object.iif
        }, function (error, links) {
          if (error) {
            cb_parallel(error);
            return;
          }

          if (!links) {
            errors.push({
              code : log_codes.related_resource_not_found.code,
              path : 'iif',
              title: log_codes.related_resource_not_found.message.replace('%s', 'iif')
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
       * oif.
       */
      if (object.oif) {
        ip_link.show({
          dev: object.oif
        }, function (error, links) {
          if (error) {
            cb_parallel(error);
            return;
          }

          if (!links) {
            errors.push({
              code : log_codes.related_resource_not_found.code,
              path : 'oif',
              title: log_codes.related_resource_not_found.message.replace('%s', 'oif')
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