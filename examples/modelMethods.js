'use strict';

const dynamo = require('../index');
const Joi    = require('joi');
const AWS    = dynamo.AWS;

AWS.config.update({region: 'us-east-1'});

const Account = dynamo.define('example-model-methods-Account', {
  hashKey : 'email',
  timestamps : true,
  schema : {
    email : Joi.string(),
    name : Joi.string(),
    age : Joi.number(),
  }
});

Account.prototype.sayHello = function () {
  console.log('Hello my name is ' + this.get('name') + ' I\'m ' + this.get('age') + ' years old');
};

Account.findByAgeRange = function (low, high) {
  Account.scan()
  .where('age').gte(low)
  .where('age').lte(high)
  .loadAll()
  .exec(function (err, data) {
    data.Items.forEach(function (account) {
      account.sayHello();
    });
  });
};


