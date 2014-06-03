var async = require('async');

var ipset = require('netfilter').ipset;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var IPSet = require('../../../models/system/ipsets/ipset').IPSet;

module.exports = function (cb_init) {
  /*
   * Already initialized.
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
       * Get all ipsets from DB.
       */
      IPSet.find({}, function (error, docs) {
        if (error) {
          cb_series(error);

          return;
        }

        if (docs && docs.length) {
          async.each(docs, function (item, cb_each) {
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
                 * Setup ipset to create it.
                 */
                item.setname = item.name;

                ipset_models[model_name + 'Options'].findOne({
                  ipset: item.name
                }, function (error, doc) {
                  if (error) {
                    cb_series2(error);

                    return;
                  }

                  if (doc) {
                    item.create_options = doc;
                  }

                  cb_series2(null);
                });
              },
              function (cb_series2) {
                /*
                 * Create the ipset.
                 */
                ipset.create(item, function (error) {
                  if (error) {
                    cb_series2(error);

                    return;
                  }

                  cb_series2(null);
                });
              },
              function (cb_series2) {
                /*
                 * Search for all entries related to this ipset and add them to the system.
                 */
                ipset_models[model_name].find({
                  ipset: item.name
                }, function (error, docs) {
                  if (error) {
                    cb_series2(error);

                    return;
                  }

                  if (docs && docs.length) {
                    async.each(docs, function (entry, cb_each2) {
                      entry.setname = entry.ipset;

                      ipset.add(entry, function (error) {
                        if (error) {
                          cb_each2(error);

                          return;
                        }

                        cb_each2(null);
                      });

                    }, function (error) {
                      if (error) {
                        cb_series2(error);

                        return;
                      }

                      cb_series2(null);
                    });

                    return;
                  }

                  cb_series2(null);
                });
              }
            ], function () {
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

          return;
        }

        cb_series(null);
      });
    }
  ], function (error) {
    if (error) {
      logger.error(error, {
        module: 'settings/ipsets',
        tags  : [
          log_tags.init,
          log_tags.db
        ]
      });

      cb_init(error);

      return;
    }

    logger.info('Module started.', {
      module: 'settings/ipsets',
      tags  : [
        log_tags.init
      ]
    });

    cb_init(null);
  });
};
