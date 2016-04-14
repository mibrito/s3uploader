'use strict'; // jshint ignore:line

let Bluebird = require('bluebird'),
    fs = Bluebird.promisifyAll(require('fs')),
    AWS = require('aws-sdk'),
    _ = require('lodash'),
    argv = require('minimist')(process.argv.slice(2));

AWS.config.region = 'us-west-1';

let params = argv.c ? require(argv.c) : {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  Bucket: 'bucketName',
  region: 'us-east-1',
  StorageClass: 'REDUCED_REDUNDANCY',
  ACL: 'public-read'
};

let s3 = Bluebird.promisifyAll(new AWS.S3(params)),
    local_file_path = argv.i,
    path_inside_s3_bucket = `${process.env.NODE_ENV || 'development'}/${argv.o}`;

fs.readFileAsync(local_file_path)
  .then(data => s3.putObjectAsync(
    _.merge(
      _.omit(params, ['accessKeyId', 'secretAccessKey', 'region']),
      {
        Bucket: params.Bucket,
        Body: data,
        Key: path_inside_s3_bucket,
      }
    )
  ))
  .then( data => {
    console.log(data);
    return fs.unlinkAsync(local_file_path);
  })
  .catch(err => { console.log(err); console.log(err.stack);});
