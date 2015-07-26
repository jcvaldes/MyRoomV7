'use strict';

/* Controllers */
// signin controller
app.controller('SigninFormController', ['$scope', '$http', '$state', 'authService', 'ngAuthSettings', 'currentUser', function ($scope, $http, $state, authService, ngAuthSettings, currentUser) {
    $scope.user = {
        username: "",
        password: "",
        useRefreshTokens: true
    };
    if (authService.authentication.isAuth && $state.$current.name == "access.signin") {
        $state.go('app.dashboard-v1');
    }
   

    $scope.user.username = authService.authentication.username;

   // authService.refreshToken().then(function (response) {
   //     $scope.tokenRefreshed = true;
   //     $scope.tokenResponse = response;
   // },
   //function (err) {
   //    $location.path('/access/signin');
   //});

    $scope.login = function () {
        $scope.authError = '';
        authService.login($scope.user).then(function (response) {
            var rol = false;
            if (response.rol == "True")
                rol = true;

            var opciones = {opcion1: response.opcion1, opcion2: response.opcion2, opcion3: response.opcion3, opcion4: response.opcion4, opcion5: response.opcion5, opcion6: response.opcion6};
            currentUser.setProfile(rol, opciones);
            $state.go('app.dashboard-v1');
        },
        function (err) {
            if (!err)
                $scope.authError = 'DATABASE CONNECTION REFUSSED';
            else
                $scope.authError = err.error_description;
        });

    }

    $scope.logOut = function () {
        authService.logOut();
        $state.go('access.signin');
    }

    
    //$scope.authentication = authService.authentication;
}]);