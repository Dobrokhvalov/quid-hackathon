/**
 * LUNA - Responsive Admin Theme
 * version 1.2
 *
 */
(function () {
    angular.module('luna', [
        'ui.router',                // Angular flexible routing
        'ui.bootstrap',             // AngularJS native directives for Bootstrap
        'ngAnimate'                // Angular animations
    ])
})();


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



/**
 *
 * navigationCtrl
 *
 */

angular
    .module('luna')
    .controller('navigationCtrl', navigationCtrl);

function navigationCtrl($scope,$rootScope){

    $scope.isSelected = function(navId, navSelected) {

        var activeRoute = $rootScope.$state.current.name;
        var separateRoutes = activeRoute.split('.');

        if (!navSelected) {navSelected = separateRoutes[1]}

        if(navId == navSelected) {
            return false
        } else if ($rootScope.$state.current.name.indexOf(navId) == -1 && navId == navSelected ) {
            return false
        } else {
            return true
        }

    }


}
/**
 * LUNA - Responsive Admin Theme
 *
 */

angular
    .module('luna')
    .directive('pageTitle', pageTitle)
    .directive('minimalizaMenu', minimalizaMenu)
    .directive('panelTools', panelTools);


/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
    return {
        link: function(scope, element) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title
                var title = 'LUNA | AngularJS Responsive WebApp';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'LUNA | ' + toState.data.pageTitle;
                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
}

/**
 * minimalizaSidebar - Directive for minimalize sidebar
 */
function minimalizaMenu($rootScope) {
    return {
        restrict: 'EA',
        template: '<div class="left-nav-toggle"><a href ng-click="minimalize()"><i class="stroke-hamburgermenu"></i> </a>',
        controller: function ($scope, $element) {

            $scope.minimalize = function () {
                $("body").toggleClass("nav-toggle");
            }
        }
    };
}


/**
 * panelTools - Directive for panel tools elements in right corner of panel
 */
function panelTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/panel_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var hpanel = $element.closest('div.panel');
                var icon = $element.find('i:first');
                var body = hpanel.find('div.panel-body');
                var footer = hpanel.find('div.panel-footer');
                body.slideToggle(300);
                footer.slideToggle(200);

                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                hpanel.toggleClass('').toggleClass('panel-collapse');
                $timeout(function () {
                    hpanel.resize();
                    hpanel.find('[id^=map-]').resize();
                }, 50);
            };

            // Function for close ibox
            $scope.closebox = function () {
                var hpanel = $element.closest('div.panel');
                hpanel.remove();
            }

        }
    };
};
