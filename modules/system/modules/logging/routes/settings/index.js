var settings_index = require('../../../../../common/settings/routes/index');

module.exports = function (req, res) {
  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_index(req, res, {
      filter  : {
        module: 'system/logging/settings'
      },
      base_url: '/system/logging'
    });
  }
  catch (error) {
    res.send(500); // Internal Server Error.
  }
};