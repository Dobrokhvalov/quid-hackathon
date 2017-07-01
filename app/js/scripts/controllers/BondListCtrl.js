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
