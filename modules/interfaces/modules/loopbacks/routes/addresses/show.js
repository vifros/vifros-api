var logger = global.vifros.logger;
var log_tags = logger.tags;

var addresses_index = require('../../../common/addresses/routes/index');

module.exports = function (req, res) {
  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    addresses_index(req, res, {
      filter  : {
        interface: req.params.loopback,
        address  : req.params.address
      },
      base_url: '/loopbacks/' + req.params.loopback,
      single  : true
    });
  }
  catch (error) {
    logger.error(error, {
      module: 'interfaces/loopbacks',
      tags  : [
        log_tags.api_request,
        log_tags.cross_rel
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
  }
};