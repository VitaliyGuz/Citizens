(function() {
    'use strict';

    angular.module('citizens.core', [])
        .constant('config', Object.freeze({
            baseUrl: 'https://poltava2015.azurewebsites.net',//'https://localhost:44301','http://localhost:6600','http://apicitizens.azurewebsites.net', #Deploy
            pageSize: 20, // by default 20
            pageSizeTabularSection: 10,
            checkDeleteItem: true,
            getExternalProviderUrl: function (provider) {
                var redirectUri = location.protocol + '//' + location.host + '/Views/AuthComplete.html';
                return this.baseUrl + "/api/Account/ExternalLogin?provider=" + provider + "&response_type=token&client_id=Citizens" + "&redirect_uri=" + redirectUri;
            },
            LOCALE_DATE_FORMAT: 'dd.MM.yyyy',
            LOCALE_ISO_DATE_FORMAT: 'yyyy-MM-ddT00:00:00+00:00',
            pathPrintTemplates: '/Views/Print',
            pathModalTemplates: '/Views/Modals',
            pathPartialTemplates: '/Views/Partials',
            patterns: {
                houseExceptBuilding: /^(\d+[а-яА-Яі-їІ-Ї]*-?\d*\/)?\d*[а-яА-Яі-їІ-Ї]*-?\d*$/,
                houseBuilding: /^\d+[а-яА-Яі-їІ-Ї]*,?-?\d*[а-яА-Яі-їІ-Ї]*\/?\d*$/
            }
        }));
})()