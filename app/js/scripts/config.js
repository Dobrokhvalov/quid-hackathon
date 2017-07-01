/**
 * LUNA - Responsive Admin Theme
 * version 1.2
 *
 */

function configState($stateProvider, $urlRouterProvider, $compileProvider) {

    // Optimize load start with remove binding information inside the DOM element
    $compileProvider.debugInfoEnabled(true);

    // Set default state
    $urlRouterProvider.otherwise("/");
    $stateProvider

        // Main content
        .state('main', {
            abstract: true,
            // url: "/",
            templateUrl: "app/views/common/content.html"

        })
        .state('main.home', {
            url: "/",
            templateUrl: "app/views/main.html",
            data: {
                pageTitle: 'Main'
            }
        })
}

angular
    .module('luna')
    .config(configState)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
