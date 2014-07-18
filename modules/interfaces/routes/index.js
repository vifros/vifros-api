var config = require('../../../config');

module.exports = function (req, res) {
  var url_prefix = req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces';

  var json_api_body = {
    links: {
      ethernets: url_prefix + '/ethernets',
      loopbacks: url_prefix + '/loopbacks',
      vlans    : url_prefix + '/vlans'
    }
  };

  res.json(200, json_api_body); // OK.
};