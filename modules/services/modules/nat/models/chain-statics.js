var async = require('async');

var iptables = require('netfilter').iptables;

/*
 * Removes all from OS.
 */
exports.purgeFromOS = function (options, cb) {
  if (!options.filter) {
    options.filter = {};
  }
  if (!options.filter.table) {
    options.filter.table = 'nat';
  }

  iptables.flush(options.filter, function (error) {
    if (error) {
      cb(error);

      return;
    }

    iptables.deleteChain(options.filter, function (error) {
      if (error) {
        cb(error);

        return;
      }

      cb(null);
    });
  });
};

exports.setDefaultPolicy = function (cb) {
  var options = {
    table : 'nat',
    target: 'ACCEPT'
  };

  var chains = [
    'PREROUTING',
    'POSTROUTING',
    'OUTPUT'
  ];

  async.each(chains, function (item, cb_parallel) {
    options.chain = item;

    iptables.policy(options, function (error) {
      if (error) {
        cb_parallel(error);

        return;
      }

      cb_parallel(null);
    });
  }, function (error) {
    if (error) {
      cb(error);

      return;
    }

    cb(null);
  });
};

exports.createFromObjectToOS = function (object, cb) {
  async.series([
    function (cb_series) {
      /*
       * Create the chain.
       */
      iptables.new({
        table: 'nat',
        chain: object.type + '-' + object.name
      }, function (error) {
        if (error) {
          cb_series(error);

          return;
        }

        cb_series(null);
      });
    },
    function (cb_series) {
      /*
       * Create the bindings to the new chain from the built-in ones.
       */
      exports.buildRuleOptions(object, function (error, rule_options) {
        iptables.append(rule_options, function (error) {
          if (error) {
            cb_series(error);

            return;
          }

          cb_series(null);
        });
      });
    }
  ], function (error) {
    if (error) {
      cb(error);

      return;
    }

    cb(null);
  });
};

exports.buildRuleOptions = function (object, cb) {
  var rule_options = {
    table: 'nat',
    jump : object.type + '-' + object.name
  };

  switch (object.type) {
    case 'source':
      rule_options.chain = 'POSTROUTING';

      if (object.interfaces && object.interfaces.out) {
        rule_options['out-interface'] = object.interfaces.out;
      }
      break;

    case 'destination':
      rule_options.chain = 'PREROUTING';

      if (object.interfaces && object.interfaces.in) {
        rule_options['in-interface'] = options.interfaces.in;
      }
      break;

    default:
      // TODO: Throw an error here?
      console.log('TODO: Throw an error here?');

      break;
  }

  if (object.description) {
    rule_options.matches = {
      comment: {
        comment: '"' + object.description + '"'
      }
    };
  }

  cb(null, rule_options);
};