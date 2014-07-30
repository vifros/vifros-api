var iptables = require('netfilter').iptables;

var NATChain = require('../models/chain').NATChain;

exports.createFromObjectToOS = function (object, cb) {
  buildRuleOptions(object, function (error, rule_options) {
    if (error) {
      cb(error);

      return;
    }

    iptables.append(rule_options, function (error) {
      if (error) {
        cb(error);

        return;
      }

      cb(null);
    });
  });
};

exports.purgeFromOS = function (object, cb) {
  buildRuleOptions(object, function (error, rule_options) {
    if (error) {
      cb(error);

      return;
    }

    iptables.delete(rule_options, function (error) {
      if (error) {
        cb(error);

        return;
      }

      cb(null);
    });
  });
};

function buildRuleOptions(object, cb) {
  var chain_name;
  var type;

  NATChain.findOne({
    name: object.chain
  }, function (error, doc) {
    if (error) {
      cb(error);

      return;
    }

    chain_name = doc.type + '-' + object.chain;
    type = doc.type;

    /*
     * Create the bindings to the new chain from the built-in ones.
     */
    var rule_options = {
      table: 'nat',
      chain: chain_name
    };

    if (object.protocol && object.protocol.field) {
      rule_options.protocol = '';

      if (object.protocol.inverted) {
        rule_options.protocol += '! ';
      }

      rule_options.protocol += object.protocol.field;
    }

    if (object.source && object.source.field) {
      rule_options.source = '';

      if (object.source.inverted) {
        rule_options.source += '! ';
      }

      rule_options.source += object.source.field;
    }

    if (object.destination && object.destination.field) {
      rule_options.destination = '';

      if (object.destination.inverted) {
        rule_options.destination += '! ';
      }

      rule_options.destination += object.destination.field;
    }

    switch (type) {
      case 'source':
        rule_options.jump = 'SNAT';
        rule_options.target_options = {};
        rule_options.target_options['to-source'] = object.to_nat.field;

        if (object.to_nat.random) {
          rule_options.target_options.random = '';
        }
        if (object.to_nat.persistent) {
          rule_options.target_options.persistent = '';
        }

        break;

      case 'destination':
        rule_options.jump = 'DNAT';
        rule_options.target_options = {};
        rule_options.target_options['to-destination'] = object.to_nat.field;

        if (object.to_nat.random) {
          rule_options.target_options.random = '';
        }
        if (object.to_nat.persistent) {
          rule_options.target_options.persistent = '';
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
  });
}