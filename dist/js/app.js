/**
 * LUNA - Responsive Admin Theme
 * version 1.2
 *
 */
(function () {
    angular.module('luna', [
        'ui.router',                // Angular flexible routing
        'ui.bootstrap',             // AngularJS native directives for Bootstrap
        'ngAnimate',                // Angular animations,
	'toastr'
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
            templateUrl: "views/common/content.html"

        })
        .state('main.main', {
            url: "/",
            templateUrl: "views/main.html",
	    controller: "BondListController as ctrl",
            data: {
                pageTitle: 'Main'
            }
        })
        .state('main.newbond', {
            url: "/bonds/new",
            templateUrl: "views/new.html",
	    controller: "NewBondController as ctrl",
            data: {
                pageTitle: 'New Bond'
            }
        }).state('main.issuedbonds', {
            url: "/bonds/issued",
            templateUrl: "views/issued-bonds.html",
	    controller: "IssuedBondsController as ctrl",
            data: {
                pageTitle: 'Issued Bonds'
            }
        }).state('main.credited', {
            url: "/bonds/credited",
            templateUrl: "views/investments.html",
	    controller: "InvestmentsController as ctrl",
            data: {
                pageTitle: 'Investments'
            }
        }).state('main.balances', {
            url: "/balances",
            templateUrl: "views/balances.html",
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

angular
    .module('luna')
    .controller('BalanceController', BalanceCtrl);

function BalanceCtrl($scope, $rootScope, BondService, TokenService) {
    var ctrl = this;
    ctrl.tokens = [];
    ctrl.eth = 0;

    ctrl.getTokens = function(token) {
	// only for test
	TokenService.getFreeTestTokens(token, ctrl.account).then(function() {
	    init();
	});
    };
    
    var init = function() {
	console.log("On investment view...");
	BondService.getAccount().then(function(account) {
	    ctrl.account = account;	    	    
	    TokenService.getTokens().then(function(tokens) {
		ctrl.tokens = tokens;
		web3.eth.getBalance(ctrl.account, function(err, result) {
		    ctrl.eth =  web3.fromWei(result.toNumber().toPrecision(4), 'ether');
		    $scope.$digest();
		});
	    });
	    
	});	
    };

    init();

};

angular
    .module('luna')
    .controller('BondListController', bondListCtrl);

function bondListCtrl($scope, $rootScope, BondService, $state, toastr){
    var ctrl = this;
    ctrl.bonds = [];
    ctrl.account = "";
    
    ctrl.buyBond = function(bond) {
	try {
	    BondService.buyBond(bond).then(function(result) {
		console.log(result);
		toastr.success('Success! You have bought some bonds!', {});		   
		$state.go('main.credited');
	    }).catch(function(err) {
		toastr.error('Error - Check input params. Error details in the console.');
		console.log(err);	    
	    });
	} catch(err) {
	    toastr.error('Error - Check input params. Error details in the console.');
	    console.log(err);	    
	}	    
    };
    
    // on view load
    var init = function() {
	console.log("On main view...");
	BondService.getAccount().then(function(account) {
	    ctrl.account = account;
	    
	    BondService.getBonds().then(function(bonds) {
		console.log("got bonds", bonds);
		ctrl.bonds = bonds;
		$scope.$digest();
	    });
	});
    };

    init();
}

angular
    .module('luna')
    .controller('InvestmentsController', investmentsCtrl);

function investmentsCtrl($scope, $rootScope, BondService) {
    var ctrl = this;
    ctrl.bonds = [];
    
    var init = function() {
	console.log("On investment view...");
	BondService.getAccount().then(function(account) {
	    ctrl.account = account;
	    BondService.getCreditorBonds(account).then(function(bonds) {
		console.log("got bonds: ", bonds);
		ctrl.bonds = bonds;
		$scope.$apply();
	    });
	});	
    };

    init();

};

angular
    .module('luna')
    .controller('IssuedBondsController', issuedCtrl);

function issuedCtrl($scope, $rootScope, BondService) {
    var ctrl = this;
    ctrl.bonds = [];

    var init = function() {
	BondService.getAccount().then(function(account) {
	    ctrl.account = account;
	    BondService.getIssuerBonds(account).then(function(bonds) {
		ctrl.bonds = bonds;
		$scope.$apply();
	    });
	});	
    };


    ctrl.payOut = function(bond) {
	BondService.payOut(bond).then(function(res) {
	    console.log(res);
	});
    };


    init();
};



/**
 *
 * navigationCtrl
 *
 */

angular
    .module('luna')
    .controller('navigationCtrl', navigationCtrl)
    .controller('HeaderCtrl', HeaderCtrl);

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


function HeaderCtrl($scope,$rootScope, BondService){
    var ctrl = this;
    ctrl.balance = null;

    var init = function() {
	BondService.getAccount().then(function(acc) {
	    web3.eth.getBalance(acc, function(err, result) {
		console.log("balance");
		ctrl.balance = web3.fromWei(result.toNumber().toPrecision(6), 'ether');
		$scope.$digest();
	    });
	});
    };


    init();

}

angular
    .module('luna')
    .controller('NewBondController', newCtrl);

function newCtrl($scope, $rootScope, toastr, toastrConfig, BondService, TokenService, $state){
    var ctrl = this;
    
    ctrl.selectedToken = null;
    ctrl.reserveSelected = false;
    ctrl.account = '';
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
    ctrl.reserveTokens = [];


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


    // in order to have borrowers ERC20 tokens in reserve
    // bond smart-contract must have approval from user to transfer tokens
    ctrl.approveReserve = function(token) {
	var token = ctrl.loan.token;
	
	TokenService.approveReserve(token).then(function() {
	    $scope.$digest();
	    toastr.success('Success! Tokens can be used for reserve now.!', {});		   
	    token.allowed = token.balance;
	});
    };
    
    
    var init = function() {
	TokenService.getTokens().then(function(tokens) {
	    ctrl.reserveTokens = tokens;
	    $scope.$digest();
	});
    };

    init();

    
    // ISSUE BOND
    ctrl.issueBond = function() {
	try {
	    BondService.issueBond(ctrl.loan).then(function(result) {		
		toastr.success('Success - Bond issued! Please wait 15s for blockchain update.', {});		   
		console.log("issued bond: ", result);
		$state.go('main.issuedbonds');
	    }).catch(function(err) {
		toastr.error('Error - Check input params. Error details in the console.');
		console.log(err);
	    });
	} catch (err) {
	    toastr.error('Error - Check input params. Error details in the console.');
	    console.log(err);	    
	}
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
                var title = 'QUID Bonds p2p Market';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'Quid Bonds p2p Market | ' + toState.data.pageTitle;
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

var web3;

angular.module('luna')
    .service('BondService', function() {

	var service = this;
	service.account = '';

	
	service.getAccount = function() {
	    return new Promise(function(resolve, reject) {
		// get current account
		web3.eth.getAccounts(function(err, d) {
		    if (err) reject(err); 
		    service.account = d[0];		
		    resolve(service.account);
		});
	    });
	};
	
	
	var fromContractToBond = function(id, obj) {
	    return {
		bondId: id,
		sum: web3.fromWei(obj[0].toNumber(), 'ether'),
		date: obj[4].toNumber(),
		percent: obj[1].toNumber(),
		days: obj[2].toNumber(),
		payable: web3.fromWei(obj[3].toNumber(), 'ether'),
		leftQnty: obj[5].toNumber(),
		qnty: obj[5].toNumber(),
		reserveQnty: obj[6].toNumber(),
		reserveToken: obj[7],
		issuer: obj[8],
		status: obj[9].toNumber()
	    };
	};

	
	var getBond = function(id) {	    
	    return new Promise(function(resolve, reject) {
		console.log("getting bond: ", id);
		BondContract.getBond(id).then(function(result) {
		    console.log("bond", result);
		    var bond = fromContractToBond(id, result);
		    resolve(bond);
		});
	    });
	};
	
	
	service.getBonds = function() {
	    return new Promise(function(resolve, reject) {
		BondContract.getBonds().then(function(result) {
		    var ids = _.map(result, function(id) { return id.toNumber();});
		    var getBondPromises = _.map(ids, getBond);
		    Promise.all(getBondPromises).then(function(bonds) {
			resolve(bonds);
		    });		    
		});
	    });
	};

	
	service.getIssuerBonds = function(address) {
	    return new Promise(function(resolve, reject) {
		BondContract.getIssuerBonds(address).then(function(result) {
		    var ids = _.map(result, function(id) { return id.toNumber();});
		    var getBondPromises = _.map(ids, getBond);
		    Promise.all(getBondPromises).then(function(bonds) {
			resolve(bonds);
		    });		    
		});
	    });
	};


	service.getCreditorBonds = function(address) {
	    return new Promise(function(resolve, reject) {
		BondContract.getCreditorBonds(address).then(function(result) {
		    var ids = _.map(result, function(id) { return id.toNumber();});
		    var getBondPromises = _.map(ids, getBond);
		    Promise.all(getBondPromises).then(function(bonds) {
			resolve(bonds);
		    });		    
		});
	    });
	};

	service.buyBond = function(bond) {
	    return new Promise(function(resolve, reject) {
		var ethToLend = parseInt(bond.sum) * bond.qnty* 0.01;
		var weiToLend = web3.toWei(ethToLend , 'ether'); // add wei to avoid rounding errors
		
		// using web3 object for sending Ether
		try {
		    BondContract._originalContractObject.buyBond.sendTransaction(bond.bondId, bond.qnty, {value: weiToLend, gas: 1000000 }, function(err, result) {
			console.log(err, result);
			if(err) reject(err);
			resolve(result);
		    });
		} catch(e) {
		    console.log("error: ", e);
		    reject(e);
		}	    
	    });
			      
	};

	service.payOut = function(bond) {
	    return new Promise(function(resolve, reject) {
		var paySum = web3.toWei(bond.payable, 'ether');
		
		// using web3 object for sending Ether
		try {
		    BondContract._originalContractObject.payOut.sendTransaction(bond.bondId, {value: paySum, gas:3000000 }, function(err, result) {
			console.log(err, result);
			if(err) reject(err);
			resolve(result);
		    });
		} catch(e) {
		    console.log("error: ", e);
		    reject(e);
		}	    
	    });
	};
	
	
	service.issueBond = function(loan) {
	    return new Promise(function(resolve, reject) {		
		BondContract._originalContractObject.issueBond(web3.toWei(loan.sum, 'ether'),
							       loan.percent,
							       web3.toWei(loan.payout, 'ether'),
							       loan.days,
							       loan.token.qnty,
							       loan.token.name,
							       loan.token.contract.address, {gas: 1000000}, function(err, result) {
								   if (err) reject(err);
								   resolve(result);
							       });
	    });
	};
	
	
    });

	    

var web3;

angular.module('luna')
    .service('TokenService', function(BondService) {
	var service = this;
	
	service.getTokenBalance= function(t) {
	    return new Promise(function(resolve, reject) {
		console.log("token: ", t);
		// how mony ERC20 tokens can transfer BondContract
		t.contract.allowance(service.account, BondContract.address).then(function(res) {
		    t.allowed = res.toNumber();
		    
		    t.contract.balanceOf(service.account).then(function(result) {
			console.log("got balance");
			t.balance = result.toNumber();			
			resolve(t);
		    });
		});
	    });
	};
	

	service.getFreeTestTokens = function(token, addr) {
	    return new Promise(function(resolve, reject) {
		token.contract.showMeTheMoney(addr, 10000).then(function() {
		    resolve();
		});
	    });
	};
	
	// approves all tokens to hold in reserve
	service.approveReserve = function(token) {
	    return token.contract.approve(BondContract.address, token.balance);
	};
	
	
	service.prepareTokens = function(tokens) {
	    return _.map(tokens, function(t) {
		return {
		    name: t.name,
		    balance: 0,
		    price: 0.001, 
		    qnty: 0,
		    contract: t.contract
		};
	    });	
	};
	

	service.getTokens = function() {
	    return new Promise(function(resolve, reject) {
		BondService.getAccount().then(function(account) {
		    service.account = account;
		    var _tokens = service.prepareTokens([
			{contract: TST, name: "TST"},
			{contract: TST2, name: "TST2"},
		    ]);
		    
		    var promises = _.map(_tokens, service.getTokenBalance);

		    Promise.all(promises).then(function(tokens) {
			console.log("got toks here: ", tokens);
			resolve(tokens);
		    });
		});
	    });
	};


	//service.getTokens();
    });
