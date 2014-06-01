var config = require('../../config');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_body = {
    links: {
      ethernets: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/ethernets',
      loopbacks: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/loopbacks',
      vlans    : req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/vlans'
    }
  };

  res.json(200, json_api_body); // OK.
};