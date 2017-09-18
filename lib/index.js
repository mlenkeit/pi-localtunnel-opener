'use strict';

const localtunnel = require('localtunnel');

module.exports = function(config) {
  config.tunnelConfig.forEach(tunnelConfig => {
    require('./open-tunnel')({
      cb: tunnelConfig.cb,
      port: tunnelConfig.port,
      localtunnel: localtunnel
    });
  });
};