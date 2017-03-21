'use strict';
angular.module('myApp.view2', ['ui.bootstrap'])

.controller('View2Ctrl', ['$scope','$http','$modal',
    function($scope, $http,$modal) {
        $scope.selectCity = null;
        $scope.StarterTest = 'Select a city from the list';
        $scope.cities = ['London', 'Paris', 'Tel Aviv', 'NYC'];
        var loader = document.getElementById('loader');
        loader.style.display = 'none';

        $scope.getCityListings = function() {
            loader.style.display = 'block';
            $http({
                method: 'GET',
                url: 'https://api.airbnb.com/v2/search_results?client_id=3092nxybyb0otqw18e8nh5nty&location='+$scope.selectCity
            }).then(function successCallback(response) {
                $scope.listings = response.data.search_results;
                loader.style.display = 'none';
            });
        };

        $scope.open = function (item) {
            loader.style.display = 'block';
            $http({
                method: 'GET',
                url: ' https://api.airbnb.com/v2/reviews?client_id=3092nxybyb0otqw18e8nh5nty&listing_id='+item.listing.id+'&role=all'
            }).then(function successCallback(response) {
                loader.style.display = 'none';
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'myModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    size:'lg',
                    resolve: {
                        item: function () {
                            return  item;
                        },
                        reviews: function(){
                            return response.data.reviews;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    console.info('Modal dismissed at: ' + new Date());
                });
            });
        };
}]);

angular.module('myApp.view2').controller('ModalInstanceCtrl', function ($scope, $modalInstance, item, reviews) {
    $scope.item = item;
    $scope.reviews = reviews;
    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});