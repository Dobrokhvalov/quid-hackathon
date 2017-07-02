var web3;

angular.module('luna')
    .service('BondService', function() {

	var service = this;
	service.account = '';

	
	service.getAccount = function() {
	    return new Promise(function(resolve, reject) {
		// get current account
		web3.eth.getAccounts(function(err, d) {
		    if (err) reject(err); 
		    service.account = d[0];		
		    resolve(service.account);
		});
	    });
	};
	
	
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
		reserveToken: obj[7],
		issuer: obj[8],
		status: obj[9].toNumber()
	    };
	};

	
	var getBond = function(id) {	    
	    return new Promise(function(resolve, reject) {
		console.log("getting bond: ", id);
		BondContract.getBond(id).then(function(result) {
		    console.log("bond", result);
		    var bond = fromContractToBond(id, result);
		    resolve(bond);
		});
	    });
	};
	
	
	service.getBonds = function() {
	    return new Promise(function(resolve, reject) {
		BondContract.getBonds().then(function(result) {
		    var ids = _.map(result, function(id) { return id.toNumber();});
		    var getBondPromises = _.map(ids, getBond);
		    Promise.all(getBondPromises).then(function(bonds) {
			resolve(bonds);
		    });		    
		});
	    });
	};

	
	service.getIssuerBonds = function(address) {
	    return new Promise(function(resolve, reject) {
		BondContract.getIssuerBonds(address).then(function(result) {
		    var ids = _.map(result, function(id) { return id.toNumber();});
		    var getBondPromises = _.map(ids, getBond);
		    Promise.all(getBondPromises).then(function(bonds) {
			resolve(bonds);
		    });		    
		});
	    });
	};


	service.getCreditorBonds = function(address) {
	    return new Promise(function(resolve, reject) {
		BondContract.getCreditorBonds(address).then(function(result) {
		    var ids = _.map(result, function(id) { return id.toNumber();});
		    var getBondPromises = _.map(ids, getBond);
		    Promise.all(getBondPromises).then(function(bonds) {
			resolve(bonds);
		    });		    
		});
	    });
	};

	service.buyBond = function(bond) {
	    return new Promise(function(resolve, reject) {
		var ethToLend = parseInt(bond.sum) * bond.qnty* 0.01;
		var weiToLend = web3.toWei(ethToLend , 'ether'); // add wei to avoid rounding errors
		
		// using web3 object for sending Ether
		try {
		    BondContract._originalContractObject.buyBond.sendTransaction(bond.bondId, bond.qnty, {value: weiToLend, gas: 1000000 }, function(err, result) {
			console.log(err, result);
			if(err) reject(err);
			resolve(result);
		    });
		} catch(e) {
		    console.log("error: ", e);
		    reject(e);
		}	    
	    });
			      
	};

	service.payOut = function(bond) {
	    return new Promise(function(resolve, reject) {
		var paySum = web3.toWei(bond.payable, 'ether');
		
		// using web3 object for sending Ether
		try {
		    BondContract._originalContractObject.payOut.sendTransaction(bond.bondId, {value: paySum, gas:3000000 }, function(err, result) {
			console.log(err, result);
			if(err) reject(err);
			resolve(result);
		    });
		} catch(e) {
		    console.log("error: ", e);
		    reject(e);
		}	    
	    });
	};
	
	
	service.issueBond = function(loan) {
	    return new Promise(function(resolve, reject) {		
		BondContract._originalContractObject.issueBond(web3.toWei(loan.sum, 'ether'),
							       loan.percent,
							       web3.toWei(loan.payout, 'ether'),
							       loan.days,
							       loan.token.qnty,
							       loan.token.name,
							       loan.token.contract.address, {gas: 1000000}, function(err, result) {
								   if (err) reject(err);
								   resolve(result);
							       });
	    });
	};
	
	
    });

	    
