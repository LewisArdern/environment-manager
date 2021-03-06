/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

var app = angular.module('EnvironmentManager', [
  'ui.grid',
  'ngRoute',
  'angularMoment',
  'EnvironmentManager.common',
  'EnvironmentManager.environments',
  'EnvironmentManager.operations',
  'EnvironmentManager.configuration',
  'EnvironmentManager.compare',
]);

// Setup global routes
app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/environments/summary/env-summary.html',
      controller: 'EnvironmentsSummaryController',
      menusection: '',
    })
    .when('/login', {
      templateUrl: '/login.html',
      allowAnonymous: true,
      menusection: '',
    })
    .otherwise({
      redirectTo: '/',
    });
});

app.run(function ($rootScope, $timeout) {
  $rootScope.canUser = function () {
    return true;
  };

  $timeout(function () {
    $rootScope.$broadcast('cookie-expired');
  }, (window.user.getExpiration() - new Date().getTime()));
});
