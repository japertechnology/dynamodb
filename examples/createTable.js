'use strict';

const dynamo = require('../index');
const AWS    = dynamo.AWS;
const Joi    = require('joi');

AWS.config.update({region: 'us-east-1'});

dynamo.define('example-Account', {
  hashKey  : 'name',
  rangeKey : 'email',
  schema : {
    name  : Joi.string(),
    email : Joi.string(),
    age   : Joi.number()
  },
  indexes : [
    {hashKey : 'name', rangeKey : 'age', type: 'local', name : 'NameAgeIndex'},
  ]
});

dynamo.define('example-GameScore', {
  hashKey  : 'userId',
  rangeKey : 'gameTitle',
  schema : {
    userId           : Joi.string(),
    gameTitle        : Joi.string(),
    topScore         : Joi.number(),
    topScoreDateTime : Joi.date(),
    wins             : Joi.number(),
    losses           : Joi.number()
  },
  indexes : [{
    hashKey    : 'gameTitle',
    rangeKey   : 'topScore',
    type       : 'global',
    name       : 'GameTitleIndex',
    projection : { NonKeyAttributes : [ 'wins' ], ProjectionType : 'INCLUDE' }
  }]
});

dynamo.createTables({
  'Account'   : {readCapacity: 1, writeCapacity: 1},
  'GameScore' : {readCapacity: 1, writeCapacity: 1}
}, function (err) {
  if(err) {
    console.log('Error creating tables', err);
  } else {
    console.log('table are now created and active');
  }
});
