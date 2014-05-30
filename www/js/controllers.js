angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('BetsCtrl', function($scope) {
  $scope.bets = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('LoginCtrl', function($scope, $state) {
   $scope.signIn = function(user) {
       console.log('Sign-In', user);

      $state.go('app.bets');
   };
})