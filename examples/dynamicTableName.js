'use strict';

const dynamo = require('../index');
const AWS    = dynamo.AWS;
const Joi    = require('joi');

AWS.config.update({region: 'us-east-1'});

const Account = dynamo.define('example-tablename', {
  hashKey : 'email',
  timestamps : true,
  schema : {
    email : Joi.string(),
    name : Joi.string(),
    age : Joi.number()
  },
  tableName : function () {
    var d = new Date();
    return ['example-dynamic-tablename', d.getFullYear(), d.getMonth() + 1].join('_');
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

dynamo.createTables(function (err) {
  if(err) {
    console.log('Failed to create tables', err);
  } else {
    console.log('tables created & active');
    Account.get('test@example.com', printAccountInfo);
    Account.get('foo@example.com', {ConsistentRead: true}, printAccountInfo);

    Account.create({email: 'test@example.com', name : 'test', age: 21}, printAccountInfo);
  }
});
