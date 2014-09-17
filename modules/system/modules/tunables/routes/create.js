var fs = require('fs');
var async = require('async');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var config = require('../../../../../config');

var Tunable = require('../models/tunable').Tunable;

module.exports = function (req, res, options) {
  if (!req.is('application/vnd.api+json')) {
    res.json(415, {
      errors: [
        {
          code : 'unsupported_media_type',
          title: 'Unsupported Media Type.'
        }
      ]
    }); // Unsupported Media Type.
    return;
  }

  var json_api_body = {
    links   : {
      tunables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/settings/tunables/{tunables.path}'
    },
    tunables: {}
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Check for required values.
   */
  var failed_required_fields = [];

  if (typeof req.body.tunables.path == 'undefined') {
    failed_required_fields.push('path');
  }
  if (typeof req.body.tunables.value == 'undefined'
    || typeof req.body.tunables.value.current == 'undefined') {

    failed_required_fields.push('value.current');
  }

  if (failed_required_fields.length) {
    // Build the error response with the required fields.
    for (var i = 0, j = failed_required_fields.length;
         i < j;
         i++) {

      json_api_errors.errors.push({
        code : log_codes.required_field.code,
        path : failed_required_fields[i],
        title: log_codes.required_field.message
      });
    }

    res.json(400, json_api_errors); // Bad Request.
    return;
  }

  /*
   * Check if the object already exists.
   */
  Tunable.findOne({
    path: req.body.tunables.path
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'system/tunables',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.json(500, {
        errors: [
          {
            code : 'internal_server_error',
            title: 'Internal Server Error.'
          }
        ]
      }); // Internal Server Error.
      return;
    }

    if (doc) {
      // There was already an object with that data.
      json_api_errors.errors.push({
        code : log_codes.already_present.code,
        path : 'path',
        title: log_codes.already_present.message
      });

      res.json(400, json_api_errors); // Bad Request.
      return;
    }

    // Run the field validations.
    Tunable.validate(req.body.tunables, function (error, api_errors) {
      if (error) {
        logger.error(error, {
          module: 'system/tunables',
          tags  : [
            log_tags.api_request,
            log_tags.db
          ]
        });

        res.json(500, {
          errors: [
            {
              code : 'internal_server_error',
              title: 'Internal Server Error.'
            }
          ]
        }); // Internal Server Error.
        return;
      }

      if (api_errors.length) {
        res.json(400, {
          errors: api_errors
        }); // Bad Request.
        return;
      }

      var tunable = new Tunable(req.body.tunables);

      async.series([
        /*
         * Get the original value for the tunable so it can be reseted later.
         */
        function (cb_series) {
          if (!tunable.value.original) {
            fs.readFile('/proc/sys/' + tunable.path.replace(/\./g, '/'), {
              encoding: 'utf8'
            }, function (error, file_content) {
              if (error) {
                cb_series(error);
                return;
              }

              tunable.value.original = file_content;
              cb_series(null);
            });
            return;
          }
          cb_series(null);
        }
      ], function (error) {
        if (error) {
          logger.error(error, {
            module: 'system/tunables',
            tags  : [
              log_tags.api_request,
              log_tags.os
            ]
          });

          res.json(500, {
            errors: [
              {
                code : 'internal_server_error',
                title: 'Internal Server Error.'
              }
            ]
          }); // Internal Server Error.
          return;
        }

        Tunable.createFromObjectToOS(tunable, function (error) {
          if (error) {
            logger.error(error, {
              module: 'system/tunables',
              tags  : [
                log_tags.api_request,
                log_tags.os
              ]
            });

            res.json(500, {
              errors: [
                {
                  code : 'internal_server_error',
                  title: 'Internal Server Error.'
                }
              ]
            }); // Internal Server Error.
            return;
          }

          /*
           * Save changes to database.
           */
          tunable.save(function (error) {
            if (error) {
              logger.error(error, {
                module: 'system/tunables',
                tags  : [
                  log_tags.api_request,
                  log_tags.db
                ]
              });

              res.json(500, {
                errors: [
                  {
                    code : 'internal_server_error',
                    title: 'Internal Server Error.'
                  }
                ]
              }); // Internal Server Error.
              return;
            }

            var item_to_send = tunable.toObject();

            delete item_to_send._id;
            delete item_to_send.__v;

            item_to_send.href = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/tunables/' + encodeURIComponent(tunable.path);

            res.location(item_to_send.href);

            /*
             * Build JSON API response.
             */
            json_api_body.tunables = item_to_send;

            res.json(200, json_api_body); // OK.
          });
        });
      });
    });
  });
};