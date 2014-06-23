angular.module('betApp.directives', [])

.directive('ngApp', function() {
  return {

    controller: 'AppCtrl',
    link:function(scope,element,attrs){
      scope.init();
    }
  }
})

.directive('contact', function() {
  return {

    controller: {

    },
    link:function(scope,element,attrs){
      scope.init();
    }
  }
});