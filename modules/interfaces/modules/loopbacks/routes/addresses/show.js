var logger = global.vifros.logger;
var log_tags = logger.tags;

var Loopback = require('../../models/loopback').Loopback;

var addresses_index = require('../../../common/addresses/routes/index');

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    addresses_index(req, res, {
      filter  : {
        interface: req.params.loopback,
        address  : req.params.address
      },
      base_url: '/loopbacks/' + req.params.loopback
    });
  }
  catch (error) {
    logger.error(error.name, {
      module: 'interfaces/loopbacks',
      tags  : [
        log_tags.api_request,
        log_tags.cross_rel
      ]
    });

    res.send(500); // Internal Server Error.
  }
};