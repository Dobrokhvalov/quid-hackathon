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
        .state('main.main', {
            url: "/",
            templateUrl: "app/views/main.html",
            data: {
                pageTitle: 'Main'
            }
        })
        .state('main.newbond', {
            url: "/bonds/new",
            templateUrl: "app/views/new.html",
	    controller: "NewBondController as ctrl",
            data: {
                pageTitle: 'New Bond'
            }
        })
}

angular
    .module('luna')
    .config(configState)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
