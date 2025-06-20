'use strict';

const dynamo = require('../index');
const AWS    = dynamo.AWS;
const Joi    = require('joi');
const async  = require('async');

AWS.config.update({region: 'us-east-1'});

const Account = dynamo.define('example-Account', {
  hashKey : 'AccountId',
  timestamps : true,
  schema : {
    AccountId : dynamo.types.uuid(),
    name : Joi.string(),
    email : Joi.string().email(),
    age : Joi.number(),
  }
});

dynamo.createTables({
  'example-Account'  : {readCapacity: 1, writeCapacity: 10},
}, function (err) {
  if(err) {
    console.log('Error creating tables', err);
    process.exit(1);
  }

  async.times(25, function(n, next) {
    Account.create({name : 'Account ' + n, email : 'account' +n + '@gmail.com', age : n}, next);
  });
});
