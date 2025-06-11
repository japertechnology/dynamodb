'use strict';

const dynamo = require('../index');
const AWS    = dynamo.AWS;
const Joi    = require('joi');

AWS.config.update({region: 'us-east-1'});

const Account = dynamo.define('example-hook', {
  hashKey : 'email',
  timestamps : true,
  schema : {
    email : Joi.string().email(),
    name  : Joi.string(),
    age   : Joi.number(),
  }
});

Account.before('create', function (data, next) {
  if(!data.name) {
    data.name = 'Foo Bar';
  }

  return next(null, data);
});

Account.before('update', function (data, next) {
  data.age = 45;
  return next(null, data);
});

Account.after('create', function (item) {
  console.log('Account created', item.get());
});

Account.after('update', function (item) {
  console.log('Account updated', item.get());
});

Account.after('destroy', function (item) {
  console.log('Account destroyed', item.get());
});

dynamo.createTables(function (err) {
  if(err) {
    console.log('Error creating tables', err);
    process.exit(1);
  }

  Account.create({email: 'test11@example.com'}, function (err, acc) {
    acc.set({age: 25});

    acc.update(function () {
      acc.destroy({ReturnValues: 'ALL_OLD'});
    });

  });

});
