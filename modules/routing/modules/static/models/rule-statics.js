var async = require('async');

var ip_rule = require('iproute').rule;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

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

  if (object.priority
    && (object.priority < 0 || object.priority > 32767)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'priority',
      title: log_codes.invalid_value.message
    });
  }

  if (object.table
    && (object.table < 0 || object.table > 2147483648)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'table',
      title: log_codes.invalid_value.message
    });
  }

  cb(null, errors);
};