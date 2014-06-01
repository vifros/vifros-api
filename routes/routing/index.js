var config = require('../../config');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_body = {
    links: {
      static  : req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static',
      settings: req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/settings'
    }
  };

  res.json(200, json_api_body); // OK.
};