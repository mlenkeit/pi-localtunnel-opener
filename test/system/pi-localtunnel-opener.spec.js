'use strict';

const exec = require('child_process').exec;
const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const url = require('url');

const startSystem = function(tunnelConfigFilepath) {
  return new Promise((resolve, reject) => {
    const cp = exec(`node index.js -c ${tunnelConfigFilepath}`, {
      cwd: path.resolve(__dirname, './../..'),
      env: process.env
    });
    cp.stdout.on('data', function(data) {
      if (/opened/i.test(data.toString())) {
        resolve(cp);
      }
    });
    cp.stderr.on('data', reject);
  });
};
const wait = function(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

describe('System Test', function() {
  
  beforeEach(function() {
    this.filepath = path.resolve(__dirname, './../fixture/sample-cb-result.txt');
    try {
      fs.unlinkSync(this.filepath);
    } catch(e) {
      // nothing
    }
    
    return startSystem('./test/fixture/config.js');
  });
  
  it('calls the configured callback function', function() {
    return wait(1000)
      .then(() => {
        fs.accessSync(this.filepath);
        const content = fs.readFileSync(this.filepath).toString();
        const urlObj = url.parse(content);
        expect(urlObj.hostname).to.contain('localtunnel.me');
      });
  });
});