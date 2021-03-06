/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

// Manage specific Upstream
angular.module('EnvironmentManager.configuration').controller('LBUpstreamController',
  function ($scope, $routeParams, $location, $q, resources, cachedResources, modal, accountMappingService) {

    $scope.LBUpstream = {};
    $scope.NewHostDefault = { DnsName: '', Port: null, FailTimeout: '30s', MaxFails: null, State: 'down', Weight: 1 };
    $scope.NewHost = angular.copy($scope.NewHostDefault);
    $scope.CopyFromName = '';
    $scope.PageError = '';
    $scope.PageMode = 'Edit'; // Edit, New, Copy
    $scope.DataFound = false;
    $scope.Version = 0;

    $scope.AddingHost = false;
    $scope.ServicesList = [];
    $scope.EnvironmentsList = [];

    var ReturnPath = '/config/upstreams/'; // Plus Environment name to get back to the previous selection

    function init() {

      var mode = $routeParams['mode'];
      var env = $routeParams['up_environment'];
      var key = $routeParams['key'];
      var returnPath = $routeParams['returnPath'];

      if (key) key = decodeURIComponent(key);
      if (returnPath) ReturnPath = decodeURIComponent(returnPath);

      $q.all([
        cachedResources.config.environments.all().then(function (environments) {
          $scope.EnvironmentsList = _.map(environments, 'EnvironmentName').sort();
        }),

        cachedResources.config.services.all().then(function (services) {
          $scope.Services = services;
          $scope.ServicesList = _.map(services, 'ServiceName').sort();
        }),
      ]).then(function () {

        $scope.PageMode = mode ? mode : 'Edit';
        if ($scope.PageMode == 'Edit' || $scope.PageMode == 'Copy') {

          if (!key || !env) {
            $scope.DataFound = false;
          } else {

            accountMappingService.GetAccountForEnvironment(env).then(function (accountName) {
              var params = {
                account: accountName,
                key: key,
              };

              resources.config.lbUpstream.get(params).then(function (data) {
                $scope.LBUpstream = data;
                updateSelectedService();

                if ($scope.PageMode == 'Copy') {
                  data.key = '';
                  $scope.CopyFromName = data.Value.UpstreamName;
                  data.Value.UpstreamName = '';
                }

                // Sort hosts by DNS
                data.Value.Hosts.sort(function (a, b) {
                  return a.DnsName.localeCompare(b.DnsName);
                });

                $scope.Version = data.Version;
                $scope.DataFound = true;

                if ($scope.PageMode == 'Edit') {
                  $scope.userHasPermission = user.hasPermission({ access: 'PUT', resource: '/' + accountName + '/config/lbupstream/' + key });
                } else {
                  $scope.userHasPermission = user.hasPermission({ access: 'POST', resource: '/*/config/lbupstream/**' });
                }

              });
            });

          }
        } else {

          // New Upstream, set defaults
          $scope.LBUpstream = {
            Value: {
              SchemaVersion: 1,
              EnvironmentName: env,
              ZoneSize: '128k',
              LoadBalancingMethod: 'least_conn',
              Hosts: [],
            },
          };

          $scope.userHasPermission = user.hasPermission({ access: 'POST', resource: '/*/config/lbupstream/**' });
        }

      });
    }

    function updateSelectedService() {
      $scope.SelectedService = _.find($scope.Services, function (service) {
        return service.ServiceName === $scope.LBUpstream.Value.ServiceName;
      });
    }

    $scope.$watch('LBUpstream.Value.ServiceName', updateSelectedService);

    $scope.canUser = function () {
      return $scope.userHasPermission;
    };

    $scope.Save = function () {

      var saveMethod = $scope.PageMode == 'Edit' ? resources.config.lbUpstream.put : resources.config.lbUpstream.post;
      var upstreamValue = $scope.LBUpstream.Value;

      if ($scope.PageMode != 'Edit' && !upstreamValue.UpstreamName.startsWith(upstreamValue.EnvironmentName + '-')) {
        $scope.PageError = 'Upstream Name must begin with the selected Environment and a dash';
        return;
      }

      var key = $scope.LBUpstream.key;
      if ($scope.PageMode != 'Edit') {
        // Auto-generate key from environment and upstream names
        key = '/' + upstreamValue.EnvironmentName + '_' + upstreamValue.UpstreamName + '/config';
      }

      accountMappingService.GetAccountForEnvironment(upstreamValue.EnvironmentName).then(function (accountName) {

        var params = {
          account: accountName,
          key: key,
          expectedVersion: $scope.Version,
          data: {
            Value: upstreamValue,
          },
        };

        var activeHosts = GetActiveHostCount();
        if (activeHosts == 0) {
          modal.confirmation({
            title: 'No Active Upstream Hosts',
            message: 'Are you sure you want to save this upstream with no active hosts?',
            action: 'Save',
          }).then(function () {
            saveMethod(params).then(function () {
              cachedResources.config.lbUpstream.flush();
              BackToSummary(upstreamValue.EnvironmentName);
            });
          });
        } else {
          saveMethod(params).then(function () {
            cachedResources.config.lbUpstream.flush();
            BackToSummary(upstreamValue.EnvironmentName);
          });
        }

      });
    };

    $scope.Cancel = function () {
      BackToSummary($scope.LBUpstream.Value.EnvironmentName);
    };

    $scope.Toggle = function () {
      $scope.LBUpstream.Value.Hosts.forEach(function (host) {
        if (host.State == 'up') {
          host.State = 'down';
        } else {
          host.State = 'up';
        }
      });
    };

    $scope.ShowAddHost = function () {
      $scope.AddingHost = true;
    };

    $scope.AddHost = function () {
      var newHost = $scope.NewHost;
      if (!newHost.DnsName || !newHost.Port || !newHost.Weight) {
        return;
      }

      $scope.LBUpstream.Value.Hosts.push(angular.copy(newHost));
      $scope.NewHost = angular.copy($scope.NewHostDefault);
      $scope.HostError = '';
      $scope.AddingHost = false;
    };

    $scope.DeleteHost = function (selectedHost) {
      $scope.LBUpstream.Value.Hosts = $scope.LBUpstream.Value.Hosts.filter(function (host) {
        return (host.DnsName != selectedHost.DnsName);
      });
    };

    function BackToSummary(environment) {
      $location.search('up_environment', environment);
      $location.path(ReturnPath);
    };

    function GetActiveHostCount() {
      if ($scope.LBUpstream.Value.Hosts.length == 0) return 0;
      var count = 0;
      $scope.LBUpstream.Value.Hosts.forEach(function (host) {
        if (host.State == 'up') count++;
      });

      return count;
    }

    init();
  });
