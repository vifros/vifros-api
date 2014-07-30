var config = require('../../../config');

module.exports = function (req, res) {
  var json_api_body = {
    links: {
      static  : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static',
      settings: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/settings'
    }
  };

  res.json(200, json_api_body); // OK.
};