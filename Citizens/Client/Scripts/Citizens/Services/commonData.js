(function () {
    'use strict';

    angular.module('citizens.core')
        .factory('commonData', commonData);

    commonData.$inject = ['$q', '$rootScope', 'cityData', 'streetData', 'regionPartData', 'neighborhoodData'];

    function commonData($q, $rootScope, cityData, streetData, regionPartData, neighborhoodData) {
        var params = [
            {
                propName: 'cities',
                dataSource: cityData,
                method: 'getAll',
                desc: 'Населені пункти'
            },
            {
                propName: 'streets',
                dataSource: streetData,
                method: 'query',
                desc: 'Вулиці'
            },
            {
                propName: 'regionParts',
                dataSource: regionPartData,
                method: 'getAll',
                desc: 'Райони'
            },
            {
                propName: 'neighborhoods',
                dataSource: neighborhoodData,
                method: 'getAll',
                desc: 'Мікрорайони'
            }
        ];

        function getPromiseAndLoadData(param) {
            if ($rootScope[param.propName] && $rootScope[param.propName].length > 0) {
                return $q.when();
            }
            return param.dataSource[param.method].call().$promise
                .then(function(resp) {
                    $rootScope[param.propName] = resp.value;
                }, function(err) {
                    err.description = param.desc + ' не завантажено';
                    return $q.reject(err);
                });
        };

        return {
            asyncLoad: function() {
                var promises = [];
                params.forEach(function(param) {
                    promises.push(getPromiseAndLoadData(param));
                });
                return $q.all(promises);
            },
            remove: function(propName) {
                $rootScope[propName] = [];
            },
            removeAll: function() {
                params.forEach(function(param) {
                    $rootScope[param.propName] = [];
                });
            }
        }
    }
})()