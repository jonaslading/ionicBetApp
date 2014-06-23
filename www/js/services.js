angular.module('betApp.services', [])

.service('betService', ['$http', '$q', function($http, $q){

  var serverURL = 'http://localhost:3000'/* 'http://betappserver.herokuapp.com' */; //on localhost while developing!!!!

  var	getAllBets = function(){

    return $http({
      method: 'GET',
      url: serverURL + '/bets'

    })
  };

  var	getAllBetsForUser = function(user){
    var d = $q.defer();

    $http({
      method: 'GET',
      url: serverURL + '/bets/' + user

    }).success(function(data, status, headers){
      d.resolve(data);
    }).error(function(data, status, headers){
      d.reject(status);
    });
    return d.promise;
  };

  var pushBetsToServer = function(bet){

    var d = $q.defer();
    $http({
      method	: 'POST',
      url		: serverURL + '/bets',
      data    : angular.toJson(bet)
    }).success(function(data, status, headers){
      d.resolve(status);
    }).error(function(data, status, headers){
      d.reject(status);
    });
    return d.promise;
  };

  var checkUserWithServer = function(user){

    var d = $q.defer();
    $http({
      method	: 'POST',
      url		: serverURL + '/auth',
      data    : angular.toJson(user)
    }).success(function(data, status, headers){
      d.resolve(data);
    }).error(function(data, status, headers){
      d.reject(status);
    });
    return d.promise;
  };

  var pushUserToServer = function(user){

    var d = $q.defer();
    $http({
      method	: 'POST',
      url		: serverURL + '/auth/new',
      data    : angular.toJson(user)
    }).success(function(data, status, headers){
      d.resolve(data);

    }).error(function(data, status, headers){
      d.reject(status);
    });
    return d.promise;
  };

  return{
    getAllBetsForUser: getAllBetsForUser,
    getAllBets: getAllBets,
    pushBetsToServer: pushBetsToServer,
    pushUserToServer: pushUserToServer,
    checkUserWithServer: checkUserWithServer
  };

}])

// Authorization interceptor

.factory('authInterceptor', function ($rootScope, $q, $window) {

  console.log('DEBUGGING: intercepting ....');

  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    responseError: function (rejection) {
      if (rejection.status === 401) {
        // handle the case where the user is not authenticated
      }
      return $q.reject(rejection);
    }
  };
})
  .factory('contacts', ['$q', function ($q) {

    return {

      getAll: function () {
        var q = $q.defer();

        var fields = ['*'];
        var options = {
          multiple: true,
          filter: ""

        };

        navigator.contacts.find(fields, function (results) {
            q.resolve(results);
          },
          function (err) {
            q.reject(err);
          },
          options);

        return q.promise;
      }

      /*
       getContact: function (contact) {
       var q = $q.defer();

       navigator.contacts.pickContact(function (contact) {

       })

       }
       */

      // TODO: method to set / get ContactAddress
      // TODO: method to set / get ContactError
      // TODO: method to set / get ContactField
      // TODO: method to set / get ContactName
      // TODO: method to set / get ContactOrganization

    }

  }]);
