/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

let assertContract = require('modules/assertContract');
let DeploymentContract = require('modules/deployment/DeploymentContract');

module.exports = function ServerRoleDefinitionKeyValueProvider() {
  this.get = function (deployment) {
    assertContract(deployment, 'deployment', { type: DeploymentContract, null: false });

    var deploymentId = deployment.id;
    var environmentName = deployment.environmentName;
    var serviceName = deployment.serviceName;
    var serviceVersion = deployment.serviceVersion;
    var serviceSlice = deployment.serviceSlice;
    var serverRole = deployment.serverRole;

    var key = serviceSlice ?
      `environments/${environmentName}/roles/${serverRole}/services/${serviceName}/${serviceSlice}` :
      `environments/${environmentName}/roles/${serverRole}/services/${serviceName}`;

    var serverRoleDefinitionKeyValue = {
      key: key,
      value: {
        Name: serviceName,
        Version: serviceVersion,
        Slice: serviceSlice || 'none',
        DeploymentId: deploymentId,
        InstanceIds: [],
      },
    };

    return Promise.resolve(serverRoleDefinitionKeyValue);
  };
};
