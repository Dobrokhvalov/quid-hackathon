angular
    .module('luna')
    .controller('BondListController', bondListCtrl);

function bondListCtrl($scope, $rootScope, BondService){
    var ctrl = this;
    ctrl.bonds = [];
    ctrl.account = "";
    
    ctrl.buyBond = function(bond) {
	BondService.buyBond(bond);
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
