'use strict';

const dynamo = require('../index');
const AWS    = dynamo.AWS;
const _      = require('lodash');
const Joi    = require('joi');
const async  = require('async');

AWS.config.update({region: 'us-east-1'});

const Product = dynamo.define('example-parallel-scan', {
  hashKey : 'id',
  timestamps : true,
  schema : {
    id        : dynamo.types.uuid(),
    accountId : Joi.number(),
    purchased : Joi.boolean().default(false),
    price     : Joi.number()
  },
});

var printInfo = function (err, resp) {
  if(err) {
    console.log(err);
    return;
  }

  console.log('Count', resp.Count);
  console.log('Scanned Count', resp.ScannedCount);

  var totalPrices = resp.Items.reduce(function (total, item) {
    return total += item.get('price');
  }, 0);

  console.log('Total purchased', totalPrices);
  console.log('Average purchased price', totalPrices / resp.Count);
};

var loadSeedData = function (callback) {
  callback = callback || _.noop;

  async.times(30, function(n, next) {
    var purchased = n %4 === 0 ? true : false;
    Product.create({accountId : n %5, purchased : purchased, price : n}, next);
  }, callback);
};

var runParallelScan = function () {

  var totalSegments = 8;

  Product.parallelScan(totalSegments)
  .where('purchased').equals(true)
  .attributes('price')
  .exec(printInfo);
};

async.series([
  async.apply(dynamo.createTables.bind(dynamo)),
  loadSeedData
], function (err) {
  if(err) {
    console.log('error', err);
    process.exit(1);
  }

  runParallelScan();
});

