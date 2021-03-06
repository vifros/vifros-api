var config = require('../../../../../config');

module.exports = function (req, res) {
  var json_api_body = {
    links: {
      rules : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/rules',
      tables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/tables'
    }
  };

  res.json(200, json_api_body); // OK.
};