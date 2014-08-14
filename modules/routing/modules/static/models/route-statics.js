var async = require('async');

var ip_route = require('iproute').route;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

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

  if (object.preference
    && (object.preference < 0 || object.preference > 4294967296)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'preference',
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