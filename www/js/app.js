
angular.module('betApp', ['ionic', 'betApp.directives', 'betApp.controllers','betApp.services', 'angucomplete'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  })
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: "/login",

        templateUrl: "templates/login.html",
        controller: 'LoginCtrl'


      })
      .state('sign-up', {
        url: "/sign-up",
        templateUrl: "templates/sign-up.html",
        controller: 'LoginCtrl'

      })

      .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
      })

      .state('app.search', {
        url: "/search",
        views: {
          'menuContent': {
            templateUrl: "templates/search.html",
            controller: 'SearchCtrl'

          }
        }
      })

      .state('app.new-bet', {
        url: "/new-bet",
        views: {
          'menuContent': {
            templateUrl: "templates/new-bet.html",
            controller: 'NewBetCtrl'
          }
        }
      })
      .state('app.bets', {
        url: "/bets",
        views: {
          'menuContent': {
            templateUrl: "templates/betlist.html",
            controller: 'BetsCtrl'
          }
        }
      })

      .state('app.single', {
        url: "/bets/:betId",
        views: {
          'menuContent': {
            templateUrl: "templates/bet.html",
            controller: 'PlaylistCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });

