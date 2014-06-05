var async = require('async');

var ip_route = require('iproute').route;

/*
 * Removes all filtered routes from DB and OS.
 */
exports.purgeFromOSandDB = function (options, cb) {
  var self = this;

  this.find(options.filter, function (error, docs) {
    if (error) {
      cb({
        server_code: 500, // Internal Server Error.
        errors     : [
          {
            code   : error.name,
            field  : '',
            message: error.message
          }
        ]
      });

      return;
    }

    if (docs && docs.length) {
      /*
       * Remove the route from OS.
       */
      async.each(docs, function (item, cb_each) {
        ip_route.delete(item, function (error) {
          if (error) {
            cb_each({
              server_code: 500, // Internal Server Error.
              errors     : [
                {
                  code   : 'iproute',
                  field  : '',
                  message: error
                }
              ]
            });

            return;
          }

          /*
           * Delete routes in DB.
           */
          self.findByIdAndRemove(item._id, function (error) {
            if (error) {
              cb_each({
                server_code: 500, // Internal Server Error.
                errors     : [
                  {
                    code   : error.name,
                    field  : '',
                    message: error.message
                  }
                ]
              });

              return;
            }

            cb_each(null);
          });
        });
      }, function (error) {
        if (error) {
          cb(error);

          return;
        }

        cb(null, {
          server_code: 204 // No Content.
        });
      });

      return;
    }

    cb(null, {
      server_code: 404 // Not found.
    });
  });
};