'use strict';

const check = require('check-types');
const localtunnel = require('localtunnel');
const winston = require('winston');

module.exports = function(config) {
  check.assert.array(config.tunnelConfig, 'config.tunnelConfig must be of type array');
  
  config.tunnelConfig.filter(tunnelConfig => {
    const valid = check.all(check.map(tunnelConfig, {
      port: check.number,
      cb: check.function
    }));
    if (!valid) {
      winston.log('warn', 'Ignoring invalid tunnel config', tunnelConfig);
    }
    return valid;
  }).forEach(tunnelConfig => {
    require('./open-tunnel')({
      cb: tunnelConfig.cb,
      port: tunnelConfig.port,
      localtunnel: localtunnel
    });
  });
};