/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const {TextEncoder} = require('util');

const encoder = new TextEncoder();

const EMPTY_ARRAY = new Uint8Array();

function toUint8Array(value) {
  if (value == null) {
    return EMPTY_ARRAY;
  }

  if (value instanceof Uint8Array) {
    return value;
  }

  if (Buffer.isBuffer(value)) {
    return new Uint8Array(value);
  }

  if (typeof value === 'string') {
    return encoder.encode(value);
  }

  return encoder.encode(String(value));
}

function makeTransformResult(code, options = {}) {
  const normalized = toUint8Array(code);

  return {
    code: normalized,
    map: options.sourceMap ? EMPTY_ARRAY : undefined,
    exports: undefined,
    references: {},
    dependencies: options.analyzeDependencies ? [] : undefined,
    warnings: []
  };
}

function transform(options = {}) {
  return makeTransformResult(options.code, options);
}

function transformStyleAttribute(options = {}) {
  const result = makeTransformResult(options.code, options);

  return {
    code: result.code,
    dependencies: result.dependencies ?? [],
    warnings: []
  };
}

function bundle(options = {}) {
  if (options.contents && !options.code) {
    return makeTransformResult(options.contents, options);
  }

  return makeTransformResult(options.code, options);
}

function bundleAsync(options = {}) {
  return Promise.resolve(bundle(options));
}

function composeVisitors(visitors) {
  return Object.assign({}, ...visitors.filter(Boolean));
}

function browserslistToTargets() {
  return {};
}

module.exports = {
  transform,
  transformStyleAttribute,
  bundle,
  bundleAsync,
  composeVisitors,
  browserslistToTargets
};
