var config = require('../../../../../config');

var VLAN = require('../models/vlan').VLAN;

var logger = global.vifros.logger;
var log_tags = logger.tags;

module.exports = function (req, res) {
  var json_api_body = {};

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
     * Build JSON API response.
     */
    var buffer = doc.toObject();

    delete buffer._id;
    delete buffer.__v;

    json_api_body.links = {
      'vlans.addresses': req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/vlans/' + doc.interface + '.' + doc.tag + '/addresses'
    };
    json_api_body.vlans = buffer;

    res.json(200, json_api_body); // OK.
  });
};