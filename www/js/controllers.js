angular.module('betApp.controllers', [])

.controller('AppCtrl', ['$scope', 'betService', '$window', '$state', '$rootScope', function($scope, betService, $window, $state, $rootScope) {

    $scope.shortName = 'WebSqlDB';
    $scope.version = '1.0';
    $scope.displayName = 'WebSqlDB';
    $scope.maxSize = 65535;
    //$scope.selectedBet;

    $scope.init = function(){
      /* 		debugging function */

      /*  	 	$scope.dropTables();    */

      /* 		End of debugging functions */
      /* Initializing dbs */

      $scope.bets=[];

      $scope.initializeDB();
      /* 		Checking user data */
      $scope.checkValidation();
      $scope.checkIfBetIsSynced();	//

      /* 		check server for new bets
       use checkIfBetIsSynced() --> to check if there are unsynced bets from last login, if then upload them...
       check if there are new bets for this user (in relation to checkValidation information (email, pass) ) either where this user is the author (in the case of login on new device) or participant (in the case where other users have made a bet with this one.).
       Only push "confirmed" bets to betlist.

       */

      $scope.pushBetDBToObject();

    };





    /* 	saving bet from new bet state */
    $scope.SaveBet = function (newBet) {
      console.log("button is pressed");
      $scope.AddValuesToDB(newBet);
      $scope.checkIfBetIsSynced();
      $state.go('app.bets');

    };

    $scope.cancelBet = function () {
      console.log("close-button is pressed");
      // Clear input fields after push
      $scope.bets.bet = "";
      $scope.bets.name = "";

    };


    /* --------------  Database ---------------- */
    /* 		Initialize database */
    $scope.initializeDB = function(){
      // This alert is used to make sure the application is loaded correctly
      // you can comment this out once you have the application working
      console.log("DEBUGGING: we are in the InitializeDB function");

      if (!window.openDatabase) {
        // not all mobile devices support databases  if it does not, the following alert will display
        // indicating the device will not be albe to run this application
        alert('Databases are not supported in this browser.');
        return;
      }

      // this line tries to open the database base locally on the device
      // if it does not exist, it will create it and return a database object stored in variable db
      if(!$scope.db){
        $scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
      }
      // this line will try to create the table User in the database justcreated/openned
      $scope.db.transaction(function(tx){

          // this line actually creates the table User if it does not exist and sets up the three columns and their types
          // note the UserId column is an auto incrementing column which is useful if you want to pull back distinct rows
          // easily from the table.
          tx.executeSql( 'CREATE TABLE IF NOT EXISTS Auth(email varchar, password varchar, token varchar)', []);

          // logout should remove user from database after pushing all bets to the server, and give an error/"are you sure" message if all bet have not been pushed

          tx.executeSql( 'CREATE TABLE IF NOT EXISTS Bet(Id INTEGER PRIMARY KEY AUTOINCREMENT, _bet_description varchar, _participant varchar, _timestamp int, _comments varchar, _is_synced, _author varchar, _id varchar)', []);

        },
        function error(err){
          alert('error on init local db ' + err);
        },
        function success(){
          console.log("database created");
          // fill db with user info here??
        });
    };

    $scope.checkValidation = function(){

      $scope.db.transaction(function (tx){
        tx.executeSql('SELECT * FROM Auth', [], function (tx, result){  // Fetch records from WebSQL
          var dataset = result.rows;
          if (dataset.length == 0 ){
            $state.go('login');
          }
          else if(!!dataset.length){
            $scope.email = dataset.item(0).email;
            $scope.password = dataset.item(0).password;
            console.log("currentUser is: "+ $scope.email);

            // query server for bets belonging to User (author==$scope.email) and (participant==$scope.email)
            $scope.db.transaction(function (tx){
              tx.executeSql('SELECT * FROM Bet', [], function (tx, result){  // Fetch records from WebSQL
                  $scope.localBets = result.rows;},
                function error(err) {
                  console.log(err)
                });
            });

            betService.getAllBetsForUser(dataset.item(0).email) //probably an async function => should use promises
              .then(function(data){
                console.log("Bets for user: "+$scope.email+" - "+JSON.stringify(data));
                // iterate through data array and push each bet entry to DB
                angular.forEach(data, function(bet){
                  $scope.addExternalBetsToDB(bet);
                });
              });



            $scope.$apply(
              $state.go('app.bets')
            );
          }
        });
      });
    };
    // helper function that takes two betArrays looks for overlapping bets, and an array with only new bets that does not overlap the existing localBets
    $scope.compareBets = function(localBets, newBets){
      var localBetsIds = {};
      var newBetsIds = {};
      var result = [];

      angular.forEach(localBets, function (el, i) {
        localBetsIds[el._id] = localBets[i];
      });

      angular.forEach(newBets, function (el, i) {
        newBetsIds[el._id] = newBets[i];
      });

      for (var i in newBetsIds) {
        if (!localBetsIds.hasOwnProperty(i)) {
          result.push(newBetsIds[i]); // now results are local...
        }
      }
      return result;


    };

    $scope.addExternalBetsToDB = function(newBet){
      // assumes that bets without author value are user generated and bets with are externally added. They must therefore only be added if they don't already exist in the DB.
      console.log("adding external bet with author");
      $scope.db.transaction(function(transaction) {
        transaction.executeSql('INSERT INTO Bet (_bet_description, _participant, _author, _id, _timestamp, _is_synced) SELECT "'+newBet.bet+'", "'+newBet.name+'","'+newBet.author+'","'+newBet._id+'","'+newBet.date+'",1 WHERE NOT EXISTS (SELECT 1 FROM Bet WHERE _id = "'+newBet._id+'") ' );
      },function error(err){console.log('error on save to local db : ' + JSON.stringify(err))}, function success(){
        $scope.$apply(
          console.log("pushing bet: "+JSON.stringify(newBet)),
          $scope.bets.push({
            content: newBet.bet,
            participant: newBet.name,
            date: newBet.date

            // only pushes name and bet => should push all bet data...
          })
        );
      });

    };

    // this is the function that puts values into the database from page #home
    $scope.AddValuesToDB = function(bet) {


      // this is the section that actually inserts the values into the User table
      var date = new Date();
      console.log("adding new bet with current user at author");
      $scope.db.transaction(function(transaction) {
        transaction.executeSql('INSERT INTO Bet(_bet_description, _participant, _author, _timestamp) VALUES ("'+bet.content+'", "'+bet.participant+'","'+$scope.email+'","'+date+'")');
      },function error(err){console.log('error on save to local db : ' + err.err)}, function success(){
        $scope.$apply(
          $scope.bets.push({
            content: bet.content,
            participant: bet.participant,
            date: date
            // only pushes name and bet => should push all bet data...
          })
        );
      });

      return false;
    };

    $scope.pushBetDBToObject = function () {
      $scope.bets = [];
      $scope.db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM Bet', [], function (tx, result) {
          var dataset = result.rows;
          for (var i = 0, item = null; i < dataset.length; i++) {

            item = dataset.item(i);

            $scope.$apply(
              $scope.bets.push({
                id: item['_id'],
                date: item['_timestamp'],
                content: item['_bet_description'],
                participant: item['_participant'],
                user: item['_author']

              })
            );
          }
        });
      }, function error(err) {
        console.log(err)
      }, function success() {
      });
    };

    $scope.checkIfBetIsSynced = function (){
      $scope.betsToPush = [];
      console.log("Checker om bets er synced");
      $scope.db.transaction(function (tx){
        tx.executeSql('SELECT * FROM Bet', [], function (tx, result){
          var dataset = result.rows;
          for (var i = 0, item = null; i < dataset.length; i++) {
            item = dataset.item(i);
            console.log("item[_is_synced] er : " + item['_is_synced'])
            if(item['_is_synced'] == null){
              $scope.$apply(
                $scope.betsToPush.push({
                  id: item['Id'],
                  date: item['_timestamp'],
                  bet: item['_bet_description'],
                  name: item['_participant'],
                  author: item['_author']
                })
              );
              $scope.PushToServer($scope.betsToPush[$scope.betsToPush.length - 1])

              console.log($scope.betsToPush);
            }
          }
        });
      },function error(err){
        console.log(err)
      }, function success(){});

    };

    $scope.dropTables = function(){

      shortName = 'WebSqlDB';
      version = '1.0';
      displayName = 'WebSqlDB';
      maxSize = 65535;

      db = openDatabase(shortName, version, displayName, maxSize);

      db.transaction(function(tx){

        // IMPORTANT FOR DEBUGGING!!!!
        // you can uncomment these next twp lines if you want the table Trip and the table Auth to be empty each time the application runs
        tx.executeSql( 'DROP TABLE Bet');
        tx.executeSql( 'DROP TABLE Auth');

      })
    };

    $scope.setBetToSynced = function (bet){
      $scope.db.transaction(function(transaction) {
          console.log('trying to set _is_synced to 1 for' + bet.id );
          transaction.executeSql('UPDATE Bet SET _is_synced = 1 WHERE Id = '+ bet.id,[]); // Inserted between "set" and "_is_finished" for reference : _end_timestamp ="'+trip.end_timestamp+'", _end_location ="'+trip.end_location+'", _end_address ="'+trip.end_address+'", _end_comments ="'+trip.end_comments+'",
        },function error(err){console.log('Error setting _is_synced to 1 '); console.log(err)}, function success(){}
      );
      return false;
    };


    /* Add data to server, ANGULAR*/
    $scope.PushToServer = function(bet){
      /*
       $scope.method = 'POST';
       $scope.url = 'http://betappserver.herokuapp.com'; //Change to server address
       $http({
       method	: $scope.method,
       url		: $scope.url + "/bets",
       data    : angular.toJson(bet),
       })
       */
      betService.pushBetsToServer(bet)
        .then(function(status) {
          // this callback will be called asynchronously
          // when the response is available
          console.log("Success!!" + status);
          if(status == 200){
            console.log("IDDDD!!" + bet.id);

            $scope.setBetToSynced(bet);
          }
        }, function(err) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          console.log("Error on PushToServer: ");


          /* Needs to check if something needs to be synced. Server needs to tell app when the bet is synced in order to ensure data.
           Check below for inspiration

           if(!!msg.responseText && !!msg.responseText.err_ids){
           if(JSON.parse(msg.responseText).err_ids != 0){
           $scope.dropRowsSynced(JSON.parse(msg.responseText).err_ids)
           }
           }

           else if(msg.status == 401){
           $scope.resetAccessToken()
           }

           else if(msg.status == 404){
           console.log("404 error ")
           }
           */

        });
    };


    $scope.registerUser = function(user){

      console.log('registering new user: '+user.mail);

      betService.pushUserToServer(user)
        .then(function(data) {
          // this callback will be called asynchronously
          // when the response is available
          if(!!data.error){
            console.log("error: "+ data.error);
            alert(data.error);

          }else{

            console.log("user is uploaded, storring loacally and in session");
            $window.sessionStorage.token = data.token;

            $scope.$root.db.transaction(function(transaction) {
                transaction.executeSql('INSERT INTO AUTH (email, password,token) VALUES ("'+user.mail+'", "'+user.password+'", "'+data.token+'")',[]);
              },function error(err){
                alert("Ups, noget gik galt. Prøv venligst igen")
                console.log(err)
              }, function success(){

                $scope.checkValidation();

              }
            );
          }
        }, function(err) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          console.log("Error on PushToServer: ");
        });

    };
    $scope.clearAllBets = function(){
      $rootScope.bets = [];
      console.log("clearing bets object. now: "+$scope.bets);
    };

    $scope.logoutUser = function(){
      console.log('logging out user: '+ $scope.email);

      // Checks if bets are synced before lofout, needs to throw an error if this is not the case!!!
      $scope.checkIfBetIsSynced();
      // Erase the token if the user logs out
      delete $window.sessionStorage.token;
      $scope.$root.db.transaction(function(transaction) {
          $scope.dropTables();
        },function error(err){
          alert("Ups, noget gik galt. Prøv venligst igen")
          console.log(err)
        }, function success(){


          $scope.clearAllBets();
          $scope.init();

        }
      );
    };

    $scope.submitToken = function(user){
      // this is the section that actually inserts the values into the User table
      console.log('requesting access token');

      betService.checkUserWithServer(user)
        .then(function(data) {
          // this callback will be called asynchronously
          // when the response is available
          if(!!data.error){
            console.log("error: "+ data.error);
            alert("Wrong email or password. Please try again.")

          }else{
            console.log("Success!!" + data.token);
            console.log("user is logged in, storring loacally and in session");
            $window.sessionStorage.token = data.token;

            // ADD DB QUERY: CHECK IF 'user' (user.email&user.password) matches a user in the DB 'auth' table. if yes then generate and return token.

            $scope.$root.db.transaction(function(transaction) {
                transaction.executeSql('INSERT INTO AUTH (email, password, token) VALUES ("'+user.mail+'", "'+user.password+'","'+data.token+'" )',[]);
              },function error(err){
                alert("Ups, noget gik galt. Prøv venligst igen")
                console.log(err)
              }, function success(){

                $scope.checkValidation();

              }
            );
          }
        })

    }
}])

.controller('BetsCtrl', function($scope) {

})
.controller('NewBetCtrl', function($scope) {}
  )
.controller('SearchCtrl', function($scope) {





    ionic.Platform.ready(function(){

      navigator.contacts.find(["name", "phoneNumbers", "emails"], function (results) {

          console.log(results);
          $scope.contactList = results;
          $scope.$apply();

        },
        function (err) {
          alert(err);
        }, {"filter":"", "multiple": true});
    });
    // contact service needs some lovin' bugs out right now
/*    contacts.getAll().then(function(results){
      $scope.contactsList = results;
      console.log("DEBUGGIN: contact object: "+JSON.stringify(results));
    },function(err){
      console.log("ERROR: contact object stuff: "+JSON.stringify(err));

    });*/

})
.controller('PlaylistCtrl', function($scope, $stateParams) {
  angular.forEach($scope.bets, function(betObj){
    if(betObj.id == $stateParams.betId){
      $scope.bet = betObj;
    }
  });

})

.controller('LoginCtrl', function($scope, $state) {
   $scope.signIn = function(user) {
       console.log('Sign-In', user);

      $state.go('app.bets');
   };
});