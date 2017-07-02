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
