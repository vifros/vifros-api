var async = require('async');

var routes = require('./routes');
var tables = require('./tables');
var rules = require('./rules');

module.exports = function (cb_init) {
  async.parallel([
    function (cb_parallel) {
      rules(cb_parallel);
    },
    function (cb_parallel) {
      tables(function (error) {
        if (error) {
          cb_parallel(error);
          return;
        }

        routes(cb_parallel);
      });
    },
  ], function (error) {
    if (error) {
      cb_init(error);
      return;
    }

    cb_init(null);
  })
};