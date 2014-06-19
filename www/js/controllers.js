angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('BetsCtrl', function($scope) {
  $scope.bets = [
    { title: 'Reggae', id: 1, date: '02/06/2014', content: "my milkshake brings all da boyz to the yard, and hell yeah, it's better than yours"  },
    { title: 'Chill', id: 2, date: '02/06/2014', content: "my milkshake brings all da boyz to the yard, and hell yeah, it's better than yours" },
    { title: 'Dubstep', id: 3, date: '02/06/2014', content: "my milkshake brings all da boyz to the yard, and hell yeah, it's better than yours" },
    { title: 'Indie', id: 4, date: '02/06/2014', content: "my milkshake brings all da boyz to the yard, and hell yeah, it's better than yours" },
    { title: 'Rap', id: 5, date: '02/06/2014', content: "my milkshake brings all da boyz to the yard, and hell yeah, it's better than yours" },
    { title: 'Cowbell', id: 6, date: '02/06/2014', content: "my milkshake brings all da boyz to the yard, and hell yeah, it's better than yours" }
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