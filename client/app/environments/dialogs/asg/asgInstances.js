/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

angular.module('EnvironmentManager.environments').component('asgInstances', {
  templateUrl: '/app/environments/dialogs/asg/asgInstances.html',
  bindings: {
    asg: '<',
    asgState: '<',
  },
  controllerAs: 'vm',
  controller: function (awsService, $q, $uibModal) {
    var vm = this;
    vm.dataLoading = false;

    vm.showAsgSingleInstance = function (instance) {
      $uibModal.open({
        component: 'asgSingleInstance',
        size: 'lg',
        resolve: {
          asg: function () {
            return vm.asg;
          },
          instance: function () {
            return instance;
          },
        },
      });
    };
  }
});
