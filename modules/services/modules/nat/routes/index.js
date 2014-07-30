var config = require('../../../../../config');

module.exports = function (req, res) {
  var url_prefix = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/services/nat';

  var json_api_body = {
    links: {
      source: url_prefix + '/source'
    }
  };

  res.json(200, json_api_body); // OK.
};