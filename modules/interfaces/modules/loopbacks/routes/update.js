var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var ip_link = require('iproute').link;

var Loopback = require('../models/loopback').Loopback;

module.exports = function (req, res) {
  if (!req.is('application/vnd.api+json')) {
    res.json(415, {
      status: '415',
      code  : 'unsupported_media_type',
      title : 'Unsupported Media Type.'
    }); // Unsupported Media Type.
    return;
  }

  var json_api_errors = {
    errors: []
  };

  Loopback.findOne({
    name: req.params.loopback
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'interfaces/loopbacks',
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

    if (!doc) {
      res.json(404, {
        errors: [
          {
            code : 'not_found',
            title: 'Not found.'
          }
        ]
      }); // Not found.
      return;
    }

    /*
     * Validate received object.
     */
    var valid_changed_options = {};
    for (var property in req.body.loopbacks) {
      if (req.body.loopbacks.hasOwnProperty(property)) {
        // Check for readonly params.
        if (property == 'name') {
          json_api_errors.errors.push({
            code : log_codes.readonly_field.code,
            path : property,
            title: log_codes.readonly_field.message
          });
        }
        else if (property == 'status'
          && req.body.loopbacks[property].hasOwnProperty('operational')) {

          json_api_errors.errors.push({
            code : log_codes.readonly_field.code,
            path : 'status.operational',
            title: log_codes.readonly_field.message
          });
        }
        else {
          valid_changed_options[property] = req.body.loopbacks[property];
        }
      }
    }

    /*
     * Update values.
     */
    for (var property in req.body.loopbacks) {
      if (req.body.loopbacks.hasOwnProperty(property)) {
        doc[property] = req.body.loopbacks[property];
      }
    }

    // Run the field validations.
    Loopback.validate(doc, function (error, api_errors) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/loopbacks',
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
        json_api_errors.errors = json_api_errors.errors.concat(api_errors);
      }

      if (json_api_errors.errors.length) {
        res.json(400, json_api_errors); // Bad Request.
        return;
      }

      if (Object.keys(valid_changed_options).length == 1
        && valid_changed_options.hasOwnProperty('description')) {

        // If only the description was changed, only save it to DB without touching the OS.
        doc.update(req.body.loopbacks, function (error) {
          if (error) {
            logger.error(error, {
              module: 'interfaces/loopbacks',
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

          res.send(204); // No Content.
        });
        return;
      }

      /*
       * Compatibilize attributes.
       */
      var ip_link_doc = JSON.parse(JSON.stringify(doc));
      ip_link_doc.dev = doc.name;
      delete ip_link_doc.name; // Since it clashes with another field name.

      ip_link_doc.state = doc.status.admin;

      // Update the interface in the OS.
      ip_link.set(ip_link_doc, function (error) {
        if (error) {
          logger.error(error, {
            module: 'interfaces/loopbacks',
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

        /*
         * Search its current operational state after the change and update db with it.
         * This is so the state still can be different than the desired one by the admin.
         */
        ip_link.show({
          dev: ip_link_doc.dev
        }, function (error, links) {
          if (error) {
            logger.error(error, {
              module: 'interfaces/loopbacks',
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

          if (!req.body.loopbacks.hasOwnProperty('status')) {
            req.body.loopbacks.status = {};
          }
          req.body.loopbacks.status.operational = links[0].state;

          doc.update(req.body.loopbacks, function (error) {
            if (error) {
              logger.error(error, {
                module: 'interfaces/loopbacks',
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

            res.send(204); // No Content.
          });
        });
      });
    });
  });
};