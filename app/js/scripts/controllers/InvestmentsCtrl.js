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
