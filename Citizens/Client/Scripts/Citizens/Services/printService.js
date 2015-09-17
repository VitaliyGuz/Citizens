"use strict";
//source: https://github.com/Bhamni/openmrs-module-bahmniapps/blob/master/ui/app/common/ui-helper/printer.js
//blog: http://tech.endeepak.com/blog/2014/05/03/printing-external-html-templates-using-angularjs/
angular.module('printService',[])
    .factory('printer', ['$rootScope', '$compile', '$http', '$timeout', '$q', function ($rootScope, $compile, $http, $timeout, $q) {
        var printHtml = function (html) {
            var deferred = $q.defer();
            var hiddenFrame = $('<iframe style="display: none"></iframe>').appendTo('body')[0];
            // this code don't work in IE
            //hiddenFrame.contentWindow.printAndRemove = function () {
            //    hiddenFrame.contentWindow.print();
            //    $(hiddenFrame).remove();
            //};
            $(hiddenFrame).load(function () {
                if (!hiddenFrame.contentDocument.execCommand('print', false, null)) {
                    hiddenFrame.contentWindow.focus();
                    hiddenFrame.contentWindow.print();
                }
                $(hiddenFrame).remove();
            });
            var htmlContent = "<!doctype html>" +
                        "<html>" +
                            '<body <!--onload="printAndRemove();-->">' +
                                html +
                            '</body>' +
                        "</html>";
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write(htmlContent);
            deferred.resolve();
            doc.close();
            return deferred.promise;
        };

       /* var openNewWindow = function (html) {
            var newWindow = window.open("printTest.html");
            newWindow.addEventListener('load', function () {
                $(newWindow.document.body).html(html);
            }, false);
        };*/

        var print = function (templateUrl, data) {
            $http.get(templateUrl).success(function (template) {
                var printScope = $rootScope.$new();
                angular.extend(printScope, data);
                var element = $compile($('<div>' + template + '</div>'))(printScope);
                var waitForRenderAndPrint = function () {
                    if (printScope.$$phase || $http.pendingRequests.length) {
                        $timeout(waitForRenderAndPrint);
                    } else {
                        // Replace printHtml with openNewWindow for debugging
                        printHtml(element.html());
                        printScope.$destroy();
                    }
                };
                waitForRenderAndPrint();
            });
        };

        var printFromScope = function (templateUrl, scope) {
            $rootScope.isBeingPrinted = true;
            $http.get(templateUrl).success(function (template) {
                var printScope = scope;
                var element = $compile($('<div>' + template + '</div>'))(printScope);
                var waitForRenderAndPrint = function () {
                    if (printScope.$$phase || $http.pendingRequests.length) {
                        $timeout(waitForRenderAndPrint);
                    } else {
                        printHtml(element.html()).then(function () {
                            $rootScope.isBeingPrinted = false;
                        });

                    }
                };
                waitForRenderAndPrint();
            });
        };
        return {
            print: print,
            printFromScope: printFromScope
        }
    }]);