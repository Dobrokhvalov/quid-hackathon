

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
