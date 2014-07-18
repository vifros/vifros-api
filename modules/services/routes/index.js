var config = require('../../../config');

module.exports = function (req, res) {
  var url_prefix = req.protocol + '://' + req.get('Host') + config.api.prefix + '/services';

  var json_api_body = {
    links: {
      nat: url_prefix + '/nat'
    }
  };

  res.json(200, json_api_body); // OK.
};