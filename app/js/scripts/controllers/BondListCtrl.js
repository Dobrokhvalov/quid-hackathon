angular
    .module('luna')
    .controller('BondListController', bondListCtrl);

function bondListCtrl($scope, $rootScope){
    var ctrl = this;
    ctrl.bonds = [];


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
	    reserveToken: obj[7]
	};
    };
    
    var getBond = function(id) {
	return new Promise(function(resolve, reject) {
	    console.log("getting bond: ", id);
	    BondContract.getBond(id).then(function(result) {
		console.log("bond", result);
		ctrl.bonds.push(fromContractToBond(id, result));
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
    
    
    ctrl.buyBond = function(bond) {
	console.log("buying bond...", bond);
	var ethToLend = parseInt(bond.sum) * bond.qnty* 0.01;
	console.log("ethToLend", ethToLend);
	var weiToLend = web3.toWei(ethToLend , 'ether'); // add wei to avoid rounding errors
	console.log("lent:", weiToLend, "bondId: ", bond.bondId, "qnty:", bond.qnty);
	
	
	// using web3 object for sending Ether
	try {
	    BondContract._originalContractObject.buyBond.sendTransaction(bond.bondId, bond.qnty, {value: weiToLend }, function(err, result) {
		console.log(err, result);
	    });
	} catch(e) {
	    console.log("error: ", e);
	}
	//BondContract._originalContractObject.buyBond.sendTransaction(1, 100, {value: web3.toWei(0.4, 'ether'), gas: 1000000}, function(result) {});
    };
    
    
    init();
}
