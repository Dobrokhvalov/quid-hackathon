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
		toastr.success('Success - Bond issued!', {});		   
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

