var config = require('../../../../../config');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_body = {
    links: {
      source: req.protocol + '://' + req.get('Host') + config.api.prefix + '/services/nat/source'
    }
  };

  res.json(200, json_api_body); // OK.
};