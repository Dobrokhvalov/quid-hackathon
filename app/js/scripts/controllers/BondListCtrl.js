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
