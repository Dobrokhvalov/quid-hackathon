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
