'use strict';

const dynamo = require('../index');
const async  = require('async');
const _      = require('lodash');
const AWS    = dynamo.AWS;
const Joi    = require('joi');

AWS.config.update({region: 'us-east-1'});

const Account = dynamo.define('example-batch-get-account', {
  hashKey : 'email',
  timestamps : true,
  schema : {
    email : Joi.string().email(),
    name  : Joi.string(),
    age   : Joi.number(),
    roles : dynamo.types.stringSet()
  }
});

var printAccountInfo = function (err, acc) {
  if(err) {
    console.log('got error', err);
  } else if (acc) {
    console.log('got account', acc.get());
  } else {
    console.log('account not found');
  }
};

var loadSeedData = function (callback) {
  callback = callback || _.noop;

  async.times(15, function(n, next) {
    var roles = n %3 === 0 ? ['admin', 'editor'] : ['user'];
    Account.create({email: 'test' + n + '@example.com', name : 'Test ' + n %3, age: n, roles : roles}, next);
  }, callback);
};

async.series([
  async.apply(dynamo.createTables.bind(dynamo)),
  loadSeedData
], function (err) {
  if(err) {
    console.log('error', err);
    process.exit(1);
  }

  // Get two accounts at once
  Account.getItems(['test1@example.com', 'test2@example.com'], function (err, accounts) {
    accounts.forEach(function (acc) {
      printAccountInfo(null, acc);
    });
  });

  // Same as above but a strongly consistent read is used
  Account.getItems(['test3@example.com', 'test4@example.com'], {ConsistentRead: true}, function (err, accounts) {
    accounts.forEach(function (acc) {
      printAccountInfo(null, acc);
    });
  });

  // Get two accounts, but only fetching the age attribute
  Account.getItems(['test5@example.com', 'test6@example.com'], {AttributesToGet : ['age']}, function (err, accounts) {
    accounts.forEach(function (acc) {
      printAccountInfo(null, acc);
    });
  });
});
