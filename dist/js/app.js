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
        })
}

angular
    .module('luna')
    .config(configState)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });

angular
    .module('luna')
    .controller('BondListController', bondListCtrl);

function bondListCtrl($scope, $rootScope){
    var ctrl = this;
    ctrl.bonds = [];


    var fromContractToBond = function(obj) {
	return {
	    sum: web3.fromWei(obj[0].toNumber(), 'ether'),
	    date: obj[4].toNumber(),
	    percent: obj[1].toNumber(),
	    days: obj[2].toNumber(),
	    payable: web3.fromWei(obj[3].toNumber(), 'ether'),
	    qnty: obj[5].toNumber(),
	    reserveQnty: obj[6].toNumber(),
	    reserveToken: obj[7]
	};
    };
    
    var getBond = function(id) {
	return new Promise(function(resolve, reject) {
	    console.log("getting bond: ", id);
	    BondContract.getBond(id).then(function(result) {
		console.log("bond", result);
		ctrl.bonds.push(fromContractToBond(result));
		$scope.$digest();
		resolve();
	    });
	});
    };

    var init = function() {
	console.log("initing..");
	BondContract.getBonds().then(function(result) {
	    var ids = _.map(result, function(id) { return id.toNumber();});
	    console.log("ids: ", ids);
	    _.map(ids, getBond);	    
	});
    };

    init();
}



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
	    // how mony ERC20 tokens can transfer BondContract
	    t.contract.allowance(ctrl.account, BondContract.address).then(function(res) {
		t.allowed = res.toNumber();
		
		t.contract.balanceOf(ctrl.account).then(function(result) {
		    console.log("got balance");
		    t.balance = result.toNumber();
		    ctrl.reserveTokens.push(t);
		    $scope.$digest();
		});
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

    // approves all tokens to hold in reserve
    ctrl.approveReserve = function() {
	var token = ctrl.loan.token;
	console.log("trying to approve: ", token.balance);
	token.contract.approve(BondContract.address, token.balance).then(function() {
	    alert("Transfer of tokens approved");
	    token.allowed = token.balance;
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


    // ISSUE BOND
    ctrl.issueBond = function() {
	console.log("submitting new bond..");
	console.log(ctrl.loan);
	var loan = ctrl.loan;
	BondContract.issueBond(web3.toWei(ctrl.loan.sum, 'ether'),
			       loan.percent,
			       web3.toWei(ctrl.loan.payout, 'ether'),
			       loan.days,
			       loan.token.qnty,
			       loan.token.contract.address,
			       loan.token.name
			      )
	    .then(function(result) {
		alert("transaction ok!");
	    });
    };

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
