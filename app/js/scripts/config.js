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
            templateUrl: "app/views/common/content.html"

        })
        .state('main.main', {
            url: "/",
            templateUrl: "app/views/main.html",
	    controller: "BondListController as ctrl",
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
        }).state('main.issuedbonds', {
            url: "/bonds/issued",
            templateUrl: "app/views/issued-bonds.html",
	    controller: "IssuedBondsController as ctrl",
            data: {
                pageTitle: 'Issued Bonds'
            }
        }).state('main.credited', {
            url: "/bonds/credited",
            templateUrl: "app/views/investments.html",
	    controller: "InvestmentsController as ctrl",
            data: {
                pageTitle: 'Investments'
            }
        }).state('main.balances', {
            url: "/balances",
            templateUrl: "app/views/balances.html",
	    controller: "BalanceController as ctrl",
            data: {
                pageTitle: 'Balances'
            }
        })

}

angular
    .module('luna')
    .config(configState)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
