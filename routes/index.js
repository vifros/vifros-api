var config = require('../config');

module.exports = function (req, res) {
  var url_prefix = req.protocol + '://' + req.get('Host') + config.get('api:prefix');

  var json_api_body = {
    links: {
      system    : url_prefix + '/system',
      interfaces: url_prefix + '/interfaces',
      routing   : url_prefix + '/routing'
    }
  };

  res.json(200, json_api_body); // OK.
};