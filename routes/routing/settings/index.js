var settings_index = require('../../common/settings/index');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_errors = {
    errors: []
  };

  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_index(req, res, {
      filter  : {
        module: 'routing/settings'
      },
      base_url: '/routing'
    });
  }
  catch (error) {
    res.send(500); // Internal Server Error.
  }
};