var async = require('async');

var ipset = require('netfilter').ipset;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../../models/common/setting').Setting;
var setting_statuses = require('../../../models/common/setting').statuses;

var package_defaults = require('./defaults');

var IPSet = require('../../../models/system/ipsets/ipset').IPSet;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
   */
  async.series([
    function (cb_series) {
      ipset.flush(function (error) {
        if (error) {
          cb_series(error);

          return;
        }

        cb_series(null);
      });
    },
    function (cb_series) {
      ipset.destroy(function (error) {
        if (error) {
          cb_series(error);

          return;
        }

        cb_series(null);
      });
    },
    function (cb_series) {
      /*
       * Add package defaults to OS.
       */
      async.each(package_defaults.ipsets, function (item, cb_each) {
        var ipset_models = require('../../../models/system/ipsets/' + item.type.replace(/:|,/, '-'));

        var model_name = '';
        for (var i = 0, j = item.type.split(/:|,/), k = j.length;
             i < k;
             i++) {

          // Capitalize.
          model_name += j[i].charAt(0).toUpperCase() + j[i].slice(1);
        }

        async.series([
          function (cb_series2) {
            /*
             * Create the ipset and save it along with its options.
             */
            ipset.create(item, function (error) {
              if (error) {
                cb_series2(error);

                return;
              }

              // Compatibilize data to the schema.
              item.name = item.setname;

              var ipset = new IPSet(item);

              async.parallel([
                function (cb_parallel) {
                  // Save the object to database.
                  ipset.save(function (error) {
                    if (error) {
                      cb_parallel(error);

                      return;
                    }

                    cb_parallel(null);
                  });
                },
                function (cb_parallel) {
                  if (item.create_options) {
                    item.create_options.ipset = item.setname;

                    var ipset_options = new ipset_models[model_name + 'Options'](item.create_options);

                    // Save the object to database.
                    ipset_options.save(function (error) {
                      if (error) {
                        cb_parallel(error);

                        return;
                      }

                      cb_parallel(null);
                    });

                    return;
                  }

                  cb_parallel(null);
                }
              ], function (error) {
                if (error) {
                  cb_series2(error);

                  return;
                }

                cb_series2(null);
              });
            });
          },
          function (cb_series2) {
            /*
             * Add the set entries.
             */
            async.each(item.entries, function (entry, cb_each2) {
              entry.setname = item.setname;

              ipset.add(entry, function (error) {
                if (error) {
                  cb_each2(error);

                  return;
                }

                entry.ipset = item.setname;
                var ipset_entry = new ipset_models[model_name](entry);

                // Save the object to database.
                ipset_entry.save(function (error) {
                  if (error) {
                    cb_each2(error);

                    return;
                  }

                  cb_each2(null);
                });
              });
            }, function (error) {
              if (error) {
                cb_series2(error);

                return;
              }

              cb_series2(null);
            });
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
          cb_series(error);

          return;
        }

        cb_series(null);
      });
    }
  ], function (error) {
    if (error) {
      logger.error(error, {
        module: 'system/ipsets',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(error);

      return;
    }

    var setting = new Setting({
      module: 'system/ipsets',
      name  : 'status',
      value : setting_statuses.enabled
    });

    setting.save(function (error) {
      if (error) {
        logger.error(error.message, {
          module: 'system/ipsets',
          tags  : [
            log_tags.init,
            log_tags.db
          ]
        });

        cb_init(error);

        return;
      }

      logger.info('Module started.', {
        module: 'system/ipsets',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(null);
    });
  });
};