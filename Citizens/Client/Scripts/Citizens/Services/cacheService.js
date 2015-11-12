(function () {
    'use strict';

    angular.module('citizens.core')
        .service('Cache', Cache);

    Cache.$inject = ['serviceUtil'];

    function Cache(serviceUtil) {
        return function() {
            var cache = [];
            this.get = function() {
                return cache;
            };
            this.set = function(data) {
                if (data && angular.isArray(data)) cache = data;
            };
            this.update = function(key, delta) {
                var ind = this.indexOf(key);
                if (ind >= 0) {
                    Object.keys(delta).forEach(function(prop) {
                        cache[ind][prop] = delta[prop];
                    });
                }
            };
            this.add = function(value) {
                if (value) cache.push(value);
            };
            this.remove = function(value) {
                var ind = this.indexOf(value);
                if (ind >= 0) cache.splice(ind, 1);
            };
            this.removeAll = function() {
                cache = [];
            };
            this.isEmpty = function() {
                return cache.length <= 0;
            };
            this.indexOf = function(elem) {
                return elem ? serviceUtil.objectIndexOf(cache, elem) : -1;
            };
            this.compareFn = null;
            this.sort = function() {
                if (!angular.isFunction(this.compareFn))
                    throw "'compareFn' is not a function";
                cache.sort(this.compareFn);
            }
        }
    }
})()