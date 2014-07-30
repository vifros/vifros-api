var settings_index = require('../../../common/settings/routes/index');

module.exports = function (req, res) {
  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_index(req, res, {
      filter  : {
        module: 'system/settings'
      },
      base_url: '/system'
    });
  }
  catch (error) {
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