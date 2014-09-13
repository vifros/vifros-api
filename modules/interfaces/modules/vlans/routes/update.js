var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var ip_link = require('iproute').link;

var VLAN = require('../models/vlan').VLAN;

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

  var vlan_interface = req.params.vlan.split('.')[0];
  var vlan_tag = req.params.vlan.split('.')[1];

  if (req.params.vlan.split('.').length != 2) {
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

  VLAN.findOne({
    interface: vlan_interface,
    tag      : vlan_tag
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'interfaces/vlans',
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
    for (var property in req.body.vlans) {
      if (req.body.vlans.hasOwnProperty(property)) {
        // Check for readonly params.
        if (property == 'interface'
          || property == 'tag') {

          json_api_errors.errors.push({
            code : log_codes.readonly_field.code,
            path : property,
            title: log_codes.readonly_field.message
          });
        }
        else if (property == 'status'
          && req.body.vlans[property].hasOwnProperty('operational')) {

          json_api_errors.errors.push({
            code : log_codes.readonly_field.code,
            path : 'status.operational',
            title: log_codes.readonly_field.message
          });
        }
        else {
          valid_changed_options[property] = req.body.vlans[property];
        }
      }
    }

    /*
     * Update values.
     */
    for (var property in req.body.vlans) {
      if (req.body.vlans.hasOwnProperty(property)) {
        doc[property] = req.body.vlans[property];
      }
    }

    // Run the field validations.
    VLAN.validate(doc, function (error, api_errors) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/vlans',
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
        doc.update(req.body.vlans, function (error) {
          if (error) {
            logger.error(error, {
              module: 'interfaces/vlans',
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
      ip_link_doc.dev = doc.interface + '.' + doc.tag;
      delete ip_link_doc.name; // Since it clashes with another field name.

      ip_link_doc.state = doc.status.admin;

      // Update the interface in the OS.
      ip_link.set(ip_link_doc, function (error) {
        if (error) {
          logger.error(error, {
            module: 'interfaces/vlans',
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
              module: 'interfaces/vlans',
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

          if (!req.body.vlans.hasOwnProperty('status')) {
            req.body.vlans.status = {};
          }
          req.body.vlans.status.operational = links[0].state;

          doc.update(req.body.vlans, function (error) {
            if (error) {
              logger.error(error, {
                module: 'interfaces/vlans',
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