/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

let co = require('co');
let guid = require('node-uuid');
let AWS = require('aws-sdk');
let common = require('./common');
let awsAccounts = require('modules/awsAccounts');

module.exports = {
  createDynamoClient: createClientWithRole(AWS.DynamoDB.DocumentClient),
  createASGClient: createClientWithRole(AWS.AutoScaling),
  createEC2Client: createClientWithRole(AWS.EC2),
  createIAMClient: createClientWithRole(AWS.IAM),
  createS3Client: createClientWithRole(AWS.S3),
  createSNSClient: createClientWithRole(AWS.SNS),
};

function createClientWithRole(ClientType) {
  return co.wrap(function* clientFactory(accountName) {
    let account = yield awsAccounts.getByName(accountName);
    let options = common.getOptions();
    if (account.Impersonate && account.RoleArn !== undefined) {
      options.credentials = yield getCredentials(account.RoleArn);
    }

    return common.create(ClientType, options);
  });
}

function getCredentials(roleARN) {
  var stsClient = new AWS.STS();
  var stsParameters = {
    RoleArn: roleARN,
    RoleSessionName: guid.v1(),
  };

  return stsClient.assumeRole(stsParameters).promise().then(response =>
    new AWS.Credentials(
      response.Credentials.AccessKeyId,
      response.Credentials.SecretAccessKey,
      response.Credentials.SessionToken
    )
  );
}