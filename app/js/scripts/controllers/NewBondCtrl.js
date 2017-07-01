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
