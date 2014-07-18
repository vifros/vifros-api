var async = require('async');
var ip_link = require('iproute').link;
var iptables = require('netfilter').iptables;

var log_codes = require('../../../../../common/logger').codes;

/**
 * Removes chain/s from OS.
 *
 * @param {object}    options
 * @param {function}  cb
 */
exports.purgeFromOS = function purgeFromOS(options, cb) {
  if (!options.table) {
    options.table = 'nat';
  }

  // First flush chain related rules since they can't be deleted if have any reference.
  iptables.flush(options, function (error) {
    if (error) {
      cb(error);
      return;
    }

    // Now delete the chain.
    iptables.deleteChain(options, function (error) {
      if (error) {
        cb(error);
        return;
      }

      cb(null);
    });
  });
};

/**
 * Set the default NAT global policy.
 *
 * @param {function} cb
 */
exports.setDefaultPolicy = function setDefaultPolicy(cb) {
  var options = {
    table : 'nat',
    target: 'ACCEPT'
  };

  var chains = [
    'PREROUTING',
    'POSTROUTING',
    'OUTPUT'
  ];

  async.each(chains, function (item, cb_each) {
    options.chain = item;

    iptables.policy(options, function (error) {
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
};

/**
 * Create a chain from passed object to the system.
 *
 * @param {object}    object
 * @param {function}  cb
 */
exports.createFromObjectToOS = function createFromObjectToOS(object, cb) {
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
       * Create the bindings to the new chain from the built-in chains.
       */
      var rule_options = exports.buildRuleOptions(object);
      iptables.append(rule_options, function (error) {
        if (error) {
          cb_series(error);
          return;
        }

        cb_series(null);
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

/**
 * Returns a parsed rule options object from a chain.
 *
 * @param   {object}    object
 * @return  {object}
 */
exports.buildRuleOptions = function buildRuleOptions(object) {
  var rule_options = {
    table: 'nat',
    jump : object.type + '-' + object.name
  };

  switch (object.type) {
    case 'source':
      rule_options.chain = 'POSTROUTING';

      if (object.oif) {
        rule_options['out-interface'] = object.oif;
      }
      break;

    case 'destination':
      rule_options.chain = 'PREROUTING';

      if (object.iif) {
        rule_options['in-interface'] = object.iif;
      }
      break;

    default:
      throw new Error('Invalid `object.type` found.');
      break;
  }

  if (object.description) {
    rule_options.matches = {
      comment: {
        comment: '"' + object.description + '"'
      }
    };
  }
  return rule_options;
};

/**
 * Validate different chain types.
 * Returns an errors array suitable for JSON API responses.
 *
 * @param   {object}      object
 * @param   {function}    cb
 */
exports.validate = function validate(object, cb) {
  var errors = [];

  if (object.name && object.name.length > 29) {
    errors.push({
      code   : log_codes.too_long.code,
      field  : '/chains/0/name',
      message: log_codes.too_long.message.replace('%s', 29 + ' chars')
    });
  }

  if (object.description && object.description.length > 256) {
    errors.push({
      code   : log_codes.too_long.code,
      field  : '/chains/0/name',
      message: log_codes.too_long.message.replace('%s', 256 + ' chars')
    });
  }

  switch (object.type) {
    case 'source':
      if (object.iif) {

        errors.push({
          code   : log_codes.invalid_field.code,
          field  : '/chains/0/iif',
          message: log_codes.invalid_field.message
        });
      }

      break;

    case 'destination':
      if (object.oif) {

        errors.push({
          code   : log_codes.invalid_field.code,
          field  : '/chains/0/oif',
          message: log_codes.invalid_field.message
        });
      }

      break;

    default:
      // Noop. Already handled upstream.
      break;
  }

  async.parallel([
    function (cb_parallel) {
      var interfaces = [];

      if (object.iif) {
        interfaces.push({
          field: 'iif',
          value: object.iif
        });
      }
      if (object.oif) {
        interfaces.push({
          field: 'oif',
          value: object.oif
        });
      }

      if (!interfaces.length) {
        cb_parallel(null);
        return;
      }

      // Get system interfaces.
      ip_link.show(function (error, links) {
        if (error) {
          cb_parallel(error);
          return;
        }

        for (var i = 0, j = interfaces.length;
             i < j;
             i++) {

          var interface_is_present = links.some(function (item) {
            return interfaces[i].value == item.name;
          });

          if (!interface_is_present) {
            errors.push({
              code   : log_codes.related_resource_not_found.code,
              field  : '/chains/0/' + interfaces[i].field,
              message: log_codes.related_resource_not_found.message.replace('%s', interfaces[i].field)
            });
          }
        }

        cb_parallel(null);
      });
    }
  ], function (error) {
    if (error) {
      cb(error);
      return;
    }

    cb(null, errors);
  });
};