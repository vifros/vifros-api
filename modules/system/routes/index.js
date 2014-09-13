var config = require('../../../config');

module.exports = function (req, res) {
  var json_api_body = {
    links: {
      logging : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/logging',
      tunables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/tunables',
      settings: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/settings',
      info    : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/info'
    }
  };

  res.json(200, json_api_body); // OK.
};