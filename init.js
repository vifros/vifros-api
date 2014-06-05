var fs = require('fs');
var path = require('path');
var async = require('async');

var config = require('./config');

var global_app;

module.exports = function (app, cb_init) {
  global_app = app;

  loadModules(
    path.dirname(require.main.filename) + path.sep + 'modules',
    cb_init);
};

/*
 * Recursive function.
 * It uses a global reference to app. This is so to not add a constant parameter to the function.
 */
function loadModules(modules_path, cb) {
  fs.readdir(modules_path, function (error, files) {
    // If code == 'ENOENT' it means that the folder doesn't exists, so ignore this case.
    if (error) {
      switch (error.code) {
        case 'ENOENT':
          // Was reached the leaf so there are no more submodules to load.
          cb(null);
          break;

        default:
          cb(error);
          break;
      }

      return;
    }

    async.each(files, function (item, cb_each) {
      if (item == 'common') {
        // Ignore the common module, since it doesn not have any init methods.
        cb_each(null);

        return;
      }

      var item_path = modules_path + path.sep + item;
      var module = require(item_path);

      // Load routes.
      if (module.setRoutes) {
        module.setRoutes(global_app);
      }

      async.series([
        function (cb_series) {
          // Init module.
          if (module.init) {
            module.init(function (error) {
              if (error) {
                cb_series(error);

                return;
              }

              cb_series(null);
            });

            return;
          }

          cb_series(null);
        },
        function (cb_series) {
          // Load submodules.
          loadModules(item_path + path.sep + 'modules', cb_series);
        }
      ], function (error) {
        if (error) {
          cb_each(error);

          return;
        }

        cb_each(null);
      });
    }, function (error) {
      if (error) {
        cb(error);

        return;
      }

      cb(null);
    });
  });
}