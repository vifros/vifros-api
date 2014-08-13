var ip_link = require('iproute').link;
var link_vl_types = require('iproute').link.utils.vl_types;
var link_statuses = require('iproute').link.utils.statuses;

var config = require('../../../../../config');

var VLAN = require('../models/vlan').VLAN;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

module.exports = function (req, res) {
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
    links: {
      vlans: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/vlans/{vlans.interface}.{vlans.tag}'
    },
    vlans: {}
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Check for required values.
   */
  var failed_required_fields = [];

  if (typeof req.body.vlans.interface == 'undefined') {
    failed_required_fields.push('interface');
  }
  if (typeof req.body.vlans.tag == 'undefined') {
    failed_required_fields.push('tag');
  }
  if (typeof req.body.vlans.status == 'undefined') {
    req.body.vlans.status = {};
  }
  if (typeof req.body.vlans.status.admin == 'undefined') {
    req.body.vlans.status.admin = link_statuses.UP;
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

  var doc_req = req.body.vlans;
  var vlan = new VLAN(doc_req);

  ip_link.add({
    link     : doc_req.interface,
    name     : doc_req.interface + '.' + doc_req.tag,
    state    : doc_req.status.admin,
    type     : link_vl_types.vlan,
    type_args: [
      {
        id: doc_req.tag
      }
    ]
  }, function (error) {
    if (error) {
      logger.error(error, {
        module: 'interfaces/vlans',
        tags  : [
          log_tags.api_request
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
      dev: doc_req.interface + '.' + doc_req.tag
    }, function (error, links) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/vlans',
          tags  : [
            log_tags.api_request
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

      vlan.status.operational = doc_req.status.operational = links[0].state;

      /*
       * Save changes to database.
       */
      vlan.save(function (error) {
        if (error) {
          logger.error(error.message, {
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

        var item_to_send = req.body.vlans;

        /*
         * Clean unneeded alias.
         */
        item_to_send.href = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/vlans/' + vlan.interface + '.' + vlan.tag;
        item_to_send.id = vlan._id;

        res.location(item_to_send.href);

        /*
         * Build JSON API response.
         */
        json_api_body.vlans = item_to_send;

        res.json(200, json_api_body); // OK.
      });
    });
  });
};