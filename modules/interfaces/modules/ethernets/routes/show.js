var config = require('../../../../../config');

var Ethernet = require('../models/ethernet').Ethernet;

var logger = global.vifros.logger;
var log_tags = logger.tags;

module.exports = function (req, res) {
  var json_api_body = {
    links    : {
      ethernets            : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/ethernets/{ethernets.name}',
      'ethernets.addresses': req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/ethernets/{ethernets.name}/addresses'
    },
    ethernets: {}
  };

  Ethernet.findOne({
    name: req.params.ethernet
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'interfaces/ethernets',
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

    json_api_body.ethernets = buffer;

    res.json(200, json_api_body); // OK.
  });
};