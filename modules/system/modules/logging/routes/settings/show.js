var settings_index = require('../../../../../common/settings/routes/index');

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_index(req, res, {
      filter  : {
        _id: req.params.setting
      },
      base_url: '/system/logging'
    });
  }
  catch (error) {
    res.send(500); // Internal Server Error.
  }
};