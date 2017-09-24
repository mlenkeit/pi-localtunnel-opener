'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const sinon = require('sinon');
const winston = require('winston');

chai.use(require('sinon-chai'));

describe('open-tunnel', function() {
  
  before('mute winston', function() {
    this.originalLogLevel = winston.level;
    winston.level = 'error';
  });
  
  after('restore winston', function() {
    winston.level = this.originalLogLevel;
  });
  
  beforeEach(function() {
    this.onOpen = sinon.spy();
    this.localtunnel = require('./../mock/localtunnel')();
    this.port = 54321;
    this.emptyOpts = {};
  });
  
  it('passes on the subdomain parameter if provided', function() {
    this.openTunnel = require('./../../lib/open-tunnel')({
      cb: this.onOpen,
      port: this.port,
      localtunnel: this.localtunnel,
      subdomain: 'my-pi-localtunnel-opener'
    });
    expect(this.localtunnel).to.be.calledWith(
      this.port,
      sinon.match.has('subdomain', 'my-pi-localtunnel-opener'),
      sinon.match.func);
  });
  
  context('when opening the tunnnel succeeds', function() {
    
    beforeEach(function() {    
      this.openTunnel = require('./../../lib/open-tunnel')({
        cb: this.onOpen,
        port: this.port,
        localtunnel: this.localtunnel
      });
    });
  
    it('opens a localtunnel tunnel on the given port', function() {
      expect(this.localtunnel).to.be.calledWith(this.port, this.emptyOpts, sinon.match.func);
    });
    
    it('invokes the callback with the port and the url', function() {
      expect(this.onOpen).to.be.calledWith(this.port, this.localtunnel.tunnel.url);
    });
    
    context('when error event is emitted', function() {
      
      beforeEach(function() {
        this.localtunnel.reset();
        this.onOpen.reset();
        this.localtunnel.tunnelEvents.emit('error', new Error());
      });
      
      it('opens a new tunnel on the given port', function() {
        expect(this.localtunnel).to.be.calledWith(this.port, this.emptyOpts, sinon.match.func);
      });
      
      it('invokes the callback with the port and the url', function() {
        expect(this.onOpen).to.be.calledWith(this.port, this.localtunnel.tunnel.url);
      });
    });
    
    context('when close event is emitted', function() {
      
      beforeEach(function() {
        this.localtunnel.reset();
        this.onOpen.reset();
        this.localtunnel.tunnelEvents.emit('close');
      });
      
      it('opens a new tunnel on the given port', function() {
        expect(this.localtunnel).to.be.calledWith(this.port, this.emptyOpts, sinon.match.func);
      });
      
      it('invokes the callback with the port and the url', function() {
        expect(this.onOpen).to.be.calledWith(this.port, this.localtunnel.tunnel.url);
      });
    });
  });
  
  context('when opening a tunnel fails', function() {
    
    beforeEach(function() {
      sinon.stub(process, 'exit');
      
      this.localtunnel.err = new Error();
    
      this.openTunnel = require('./../../lib/open-tunnel')({
        cb: this.onOpen,
        port: this.port,
        localtunnel: this.localtunnel
      });
    });
    
    afterEach(function() {
      process.exit.restore();
    });
    
    it('exits the process with 1', function() {
      expect(process.exit).to.be.calledWith(1);
    });
  });
});