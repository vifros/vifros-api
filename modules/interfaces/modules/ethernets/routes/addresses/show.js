var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var Ethernet = require('../../models/ethernet').Ethernet;

var addresses_index = require('../../../common/addresses/routes/index');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_errors = {
    errors: []
  };

  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    addresses_index(req, res, {
      filter  : {
        interface: req.params.ethernet,
        address  : req.params.address
      },
      base_url: '/ethernets/' + req.params.ethernet
    });
  }
  catch (error) {
    logger.error(error.name, {
      module: 'interfaces/ethernets',
      tags  : [
        log_tags.api_request,
        log_tags.cross_rel
      ]
    });

    res.send(500); // Internal Server Error.
  }
};