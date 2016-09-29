/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

const RESOURCE = 'config/lbsettings';
const PARTITION_KEY = 'EnvironmentName';
const SORT_KEY = 'VHostName';

let dynamoHelper = new (require('api/api-utils/DynamoHelper'))(RESOURCE);
let metadata = require('commands/utils/metadata');

/**
 * GET /config/lb-settings
 */
function getLBsettingsConfig(req, res, next) {
  return dynamoHelper.getAll().then(data => res.json(data)).catch(next);
}

/**
 * GET /config/lb-settings/{environment}/{vHostName}
 */
function getLBsettingConfigByName(req, res, next) {
  const key = req.swagger.params.environment.value;
  const range = req.swagger.params.vHostName.value;
  return dynamoHelper.getBySortKey(key, range).then(data => res.json(data)).catch(next);
}

/**
 * POST /config/lb-settings
 */
function postLBsettingsConfig(req, res, next) {
  const value = req.swagger.params.body.value;
  const pKey = value[PARTITION_KEY];
  const sKey = value[SORT_KEY];
  const user = req.user;

  return dynamoHelper
    .createWithSortKey(value, pKey, sKey, user)
    .then(_ => res.status(201).end())
    .catch(next);
}

/**
 * PUT /config/lb-settings/{environment}/{vHostName}
 */
function putLBsettingConfigByName(req, res, next) {
  const value = req.swagger.params.body.value;
  const pKey = req.swagger.params.environment.value;
  const sKey = req.swagger.params.vHostName.value;
  const expectedVersion = req.swagger.params['expected-version'].value;
  const user = req.user;

  return dynamoHelper
    .updateWithSortKey(value, pKey, sKey, expectedVersion, user)
    .then(_ => res.status(200).end())
    .catch(next);
}

/**
 * DELETE /config/lb-settings/{environment}/{vHostName}
 */
function deleteLBsettingConfigByName(req, res, next) {
  const pKey = req.swagger.params.environment.value;
  const sKey = req.swagger.params.vHostName.value;
  const user = req.user;

  return dynamoHelper
    .deleteItemWithSortKey(pKey, sKey, user)
    .then(_ => res.status(200).end())
    .catch(next);
}

module.exports = {
  getLBsettingsConfig,
  getLBsettingConfigByName,
  postLBsettingsConfig,
  putLBsettingConfigByName,
  deleteLBsettingConfigByName
};