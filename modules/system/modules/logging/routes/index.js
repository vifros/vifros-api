var config = require('../../../../../config');

module.exports = function (req, res) {
  var json_api_body = {
    links: {
      logs    : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/logging/logs',
      settings: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/logging/settings'
    }
  };

  res.json(200, json_api_body); // OK.
};