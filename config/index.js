var path = require('path');
var nconf = require('nconf');

/*
 * Setup nconf to use (in-order):
 *  1. Command-line arguments.
 *  2. Environment variables.
 */
nconf
  .argv()
  .env('_');

var environment = nconf.get('NODE:ENV') || 'development';

nconf.file(environment, path.dirname(require.main.filename) + '/config/' + environment + '.json');

module.exports = nconf;