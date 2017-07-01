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
angular
    .module('luna')
    .controller('NewBondController', newCtrl);

function newCtrl($scope, $rootScope){
    var ctrl = this;
    
    ctrl.selectedToken = null;
    ctrl.reserveSelected = false;

    ctrl.reserveRatio = 0.5;
    
    ctrl.loan = {
	sum: 0,
	percent: 0,
	days: 30,
	token: {
	    qnty: 0,
	},
	payout: 0,
	reserve: 0
    };

    
    
    ctrl.reserveTokens = [ ];


    ctrl.onReserveTokenChange = function() {
	console.log("selected: ", ctrl.selectedToken);

	ctrl.loan.token = ctrl.selectedToken;
	ctrl.calcLoan();
	ctrl.reserveSelected = true;
    };
    
    ctrl.issueBond = function() {
	console.log("submitting new bond..");
	console.log(ctrl.loan);
    };

    ctrl.calcLoanSum = function() {
	ctrl.loan.reserve = ctrl.loan.token.qnty * ctrl.loan.token.price;
	ctrl.loan.sum = ctrl.loan.reserve * ctrl.reserveRatio;
    };

    ctrl.calcPayout = function() {
	ctrl.loan.payout = ctrl.loan.sum * (100 + ctrl.loan.percent* (ctrl.loan.days/365))/100  ;
    };
    
    ctrl.calcLoan = function() {
	if (ctrl.loan.token.qnty > ctrl.loan.token.balance) {
	    ctrl.loan.token.qnty = ctrl.loan.token.balance; 
	}
	
	ctrl.calcLoanSum();	
	ctrl.calcPayout();
    };

    ctrl.account = '';

    ctrl.getTokenBalance= function(t) {
	return new Promise(function(resolve, reject) {
	    console.log("token: ", t);
	    t.contract.balanceOf(ctrl.account).then(function(result) {
		console.log("got balance");
		t.balance = result.toNumber();
		ctrl.reserveTokens.push(t);
		$scope.$digest();
	    });
	});
    };

    ctrl.getAccount = function() {

	return new Promise(function(resolve, reject) {
	    // get current account
	    web3.eth.getAccounts(function(err, d) {
		if (err) { reject(err);
			 }
		ctrl.account = d[0];		
		resolve();
	    });
	});
    };

    
    ctrl.prepareTokens = function(tokens) {
	
	return _.map(tokens, function(t) {
	    return {
		name: t.name,
		balance: 0,
		price: 0.001, 
		qnty: 0,
		contract: t.contract
	    };
	});
	
    }
    
    var init = function() {
	ctrl.getAccount().then(function() {
	    var _tokens = ctrl.prepareTokens([
		{contract: TST, name: "TST"},
		{contract: TST2, name: "TST2"},
	    ]);

	    _.map(_tokens, function(t) {
		ctrl.getTokenBalance(t);
	    });	
	});
    };
    init();
    
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
