var ip_forward = require('iproute').utils.ip_forward;

var settings_update = require('../../../common/settings/routes/update');

module.exports = function (req, res) {
  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_update(req, res, {
      cb_update: cb_update
    });
  }
  catch (error) {
    res.json(500, {
      errors: [
        {
          code : 'internal_server_error',
          title: 'Internal Server Error.'
        }
      ]
    }); // Internal Server Error.
  }
};

/*
 * Function for cross-relationships.
 */
function cb_update(setting, cb) {
  if (typeof arguments[0] != 'object'
    || typeof arguments[1] != 'function') {

    throw new Error('Invalid arguments. Signature: (setting, callback)');
  }

  switch (setting.name) {
    case 'ip_forward_v4':
      if (setting.value == '0') {
        ip_forward.v4.disable(function (error) {
          if (error) {
            cb(error);
            return;
          }

          cb(null);
        });
        return;
      }

      if (setting.value == '1') {
        ip_forward.v4.enable(function (error) {
          if (error) {
            cb(error);
            return;
          }

          cb(null);
        });
        return;
      }

      cb('Error: invalid ip_forward_v4 value, has to be 0 or 1 and it is: ' + setting.value);
      break;

    case 'ip_forward_v6':
      if (setting.value == '0') {
        ip_forward.v6.disable(function (error) {
          if (error) {
            cb(error);
            return;
          }

          cb(null);
        });
        return;
      }

      if (setting.value == '1') {
        ip_forward.v6.enable(function (error) {
          if (error) {
            cb(error);
            return;
          }

          cb(null);
        });
        return;
      }

      cb('Error: invalid ip_forward_v6 value, has to be 0 or 1 and it is: ' + setting.value);
      break;

    default:
      cb(null);
      break;
  }
}