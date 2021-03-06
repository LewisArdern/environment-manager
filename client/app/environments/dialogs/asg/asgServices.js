/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

angular.module('EnvironmentManager.environments').component('asgServices', {
  templateUrl: '/app/environments/dialogs/asg/asgServices.html',
  bindings: {
    asg: '<',
    asgState: '<',
  },
  controllerAs: 'vm',
  controller: function (roles, $uibModal, modal, Deployment, serviceDiscovery) {
    var vm = this;
    vm.servicesList = vm.asgState.Services;

    vm.showDeploymentLog = function (service) {
      Deployment.getById(vm.asg.$accountName, service.DeploymentId).then(function (deployment) {
        $uibModal.open({
          templateUrl: '/app/operations/deployments/ops-deployment-details-modal.html',
          windowClass: 'deployment-summary',
          controller: 'DeploymentDetailsModalController',
          size: 'lg',
          resolve: {
            deployment: function () {
              return deployment;
            },
          },
        });
      });
    };

    vm.showAsgSingleService = function (service) {
      $uibModal.open({
        component: 'asgSingleService',
        size: 'lg',
        resolve: {
          asg: function () {
            return vm.asg;
          },
          asgState: function() {
            return vm.asgState;
          },
          serviceName: function () {
            return service.Name;
          },
        },
      });
    };
    
  }
});
