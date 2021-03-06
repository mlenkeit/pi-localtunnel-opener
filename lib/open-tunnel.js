'use strict';

const check = require('check-types');
const winston = require('winston');

module.exports = function(config) {
  check.assert.function(config.cb, 'config.cb must be of type function');
  check.assert.function(config.localtunnel, 'config.localtunnel must be of type function');
  check.assert.number(config.port, 'config.port must be of type number');
  check.assert.maybe.string(config.subdomain, 'config.subdomain must be of type subdomain');
  
  const opts = {};
  if (config.subdomain) {
    opts.subdomain = config.subdomain;
  }
  
  const openTunnel = () => {
    winston.log('info', `Opening tunnel to port ${config.port}...`);
    const tunnel = config.localtunnel(config.port, opts, (err, tunnel) => {
      if (err) {
        winston.log('error', `Failed to open port: ${err}`);
        return process.exit(1);
      }
      winston.log('info', `Port ${config.port} opened via ${tunnel.url}.`);
      config.cb(config.port, tunnel.url);
    });
    
    tunnel.on('close', () => {
      winston.log('warn', `Tunnel to port ${config.port} closed`);
      openTunnel();
    });
    tunnel.on('error', err => {
      winston.log('warn', `Error on tunnel to port ${config.port}: ${err}`);
      openTunnel();
    });
  };
  
  openTunnel();
};