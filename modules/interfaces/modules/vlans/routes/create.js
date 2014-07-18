var ip_link = require('iproute').link;
var link_vl_types = require('iproute').link.utils.vl_types;

var config = require('../../../../../config');

var VLAN = require('../models/vlan').VLAN;

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;
var log_codes = require('../../../../../common/logger').codes;

module.exports = function (req, res) {
  if (!req.is('application/vnd.api+json')) {
    res.send(415); // Unsupported Media Type.

    return;
  }

  var json_api_body = {
    links: {
      vlans: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/vlans' + '/' + '{vlans.interface}.{vlans.tag}'
    },
    vlans: []
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Check for required values.
   */
  var failed_required_fields = [];

  if (typeof req.body.vlans[0].interface == 'undefined') {
    failed_required_fields.push('interface');
  }
  if (typeof req.body.vlans[0].tag == 'undefined') {
    failed_required_fields.push('tag');
  }
  if (typeof req.body.vlans[0].status == 'undefined') {
    failed_required_fields.push('status');
  }
  else if (typeof req.body.vlans[0].status.admin == 'undefined') {
    failed_required_fields.push('status.admin');
  }

  if (failed_required_fields.length) {
    // Build the error response with the required fields.
    for (var i = 0, j = failed_required_fields.length;
         i < j;
         i++) {

      json_api_errors.errors.push({
        code   : log_codes.required_field.code,
        field  : '/vlans/0/' + failed_required_fields[i],
        message: log_codes.required_field.message
      });
    }

    res.json(400, json_api_errors); // Bad Request.

    return;
  }

  var doc_req = req.body.vlans[0];

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

      res.send(500); // Internal Server Error.

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

        res.send(500); // Internal Server Error.

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

          res.send(500); // Internal Server Error.

          return;
        }

        var item_to_send = req.body.vlans[0];

        /*
         * Clean unneeded alias.
         */
        item_to_send.href = req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/vlans' + '/' + vlan.interface + '.' + vlan.tag;
        item_to_send.id = vlan._id;

        res.location(item_to_send.href);

        /*
         * Build JSON API response.
         */
        json_api_body.vlans = [];
        json_api_body.vlans.push(item_to_send);

        res.json(200, json_api_body); // OK.
      });
    });
  });
};