'use strict';

const path = require('path');

module.exports = [{
  port: 54321,
  cbPath: path.resolve(__dirname, './sample-cb.js')
}, {
  port: 54323
}, {
  port: 'i am invalid'
}];