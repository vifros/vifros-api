var logger = global.vifros.logger;
var log_tags = logger.tags;

var settings_index = require('../../../common/settings/routes/index');

module.exports = function (req, res) {
  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_index(req, res, {
      filter  : {
        name: req.params.setting
      },
      base_url: '/system',
      single  : true
    });
  }
  catch (error) {
    logger.error(error, {
      module: 'system/settings',
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
  }
};