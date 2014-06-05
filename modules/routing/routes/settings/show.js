var settings_index = require('../../../common/settings/routes/index');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

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
    res.send(500); // Internal Server Error.
  }
};