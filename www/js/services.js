
betApp.service('betService', ['$http', '$q', function($http, $q){

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

}]);