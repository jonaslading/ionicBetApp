

betApp.directive('ngApp', function() {
  return {

    controller: 'AppCtrl',
    link:function(scope,element,attrs){
      scope.init();
    }
  }
});

betApp.directive('betList', function() {
  return {
    restrict: 'EA',
    replace: false,
    scope:{
      action: '&', // is not being used right now...
      bet: '=',
      bets: '='
    },
    /* 	    template: '<tr class="betList" ng-click="handleClick()"><td> {{bet.bet}}</td><td>{{bet.name}}</td></tr>', */
    templateUrl: 'src/templates/betList.html',
    controller: 'BetListCtrl',
    link:function(scope,element,attrs){

      /* watch function on bets object (containing all bets)*/
    }
  }
});