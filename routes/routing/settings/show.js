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
        name: req.params.setting
      },
      base_url: '/routing'
    });
  }
  catch (error) {
    json_api_errors.errors.push({
      code   : error.name,
      field  : '',
      message: error.message
    });

    res.json(500, json_api_errors); // Internal Server Error.
  }
};