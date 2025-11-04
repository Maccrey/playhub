/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const Module = require('module');
const path = require('path');

const stubPath = path.join(__dirname, '..', 'stubs', 'lightningcss-stub.cjs');
const targetIds = new Set([
  'lightningcss/node',
  'lightningcss/node/index',
  'lightningcss/node/index.js'
]);

const originalLoad = Module._load;

Module._load = function overriddenLoad(request, ...rest) {
  if (targetIds.has(request)) {
    return require(stubPath);
  }

  return originalLoad.call(this, request, ...rest);
};
