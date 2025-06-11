'use strict';

const dynamo = require('../index');
const fs     = require('fs');
const AWS    = dynamo.AWS;
const Joi    = require('joi');

AWS.config.update({region: 'us-east-1'});

const BinModel = dynamo.define('example-binary', {
  hashKey : 'name',
  timestamps : true,
  schema : {
    name : Joi.string(),
    data : Joi.binary()
  }
});

var printFileInfo = function (err, file) {
  if(err) {
    console.log('got error', err);
  } else if (file) {
    console.log('got file', file.get());
  } else {
    console.log('file not found');
  }
};

dynamo.createTables(function (err) {
  if(err) {
    console.log('Error creating tables', err);
    process.exit(1);
  }

  fs.readFile(__dirname + '/basic.js', function (err, data) {
    if (err)  {
      throw err;
    }

    BinModel.create({name : 'basic.js', data: data}, printFileInfo);

  });
});
