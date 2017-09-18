'use strict';

const async = require('async');
const exec = require('child_process').exec;
const expect = require('chai').expect;
const fs = require('fs');
const kill = require('tree-kill');
const path = require('path');
const request = require('request');
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
    this.cps = [];
  });
  
  afterEach(function(done) {
    async.each(this.cps, function(cp, cb) {
      var pid = cp.pid;
      kill(pid, 'SIGKILL', function(/*err*/) {
        cb();
      });
    }, done);
  });
  
  beforeEach(function() {
    this.filepath = path.resolve(__dirname, './../fixture/sample-cb-result.txt');
    try {
      fs.unlinkSync(this.filepath);
    } catch(e) {
      // nothing
    }
    
    return startSystem('./test/fixture/config.js')
      .then(cp => this.cps.push(cp));
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
  
  it('starts a webserver on the specified port (only for pm2)', function(done) {
    request(`http://localhost:${process.env.PORT}`,
      (err, response) => {
        expect(err, 'err').to.equal(null);
        expect(response)
          .to.have.property('statusCode', 200);
        done();
      });
  });
});