var web3;

angular.module('luna')
    .service('TokenService', function(BondService) {
	var service = this;
	
	service.getTokenBalance= function(t) {
	    return new Promise(function(resolve, reject) {
		console.log("token: ", t);
		// how mony ERC20 tokens can transfer BondContract
		t.contract.allowance(service.account, BondContract.address).then(function(res) {
		    t.allowed = res.toNumber();
		    
		    t.contract.balanceOf(service.account).then(function(result) {
			console.log("got balance");
			t.balance = result.toNumber();			
			resolve(t);
		    });
		});
	    });
	};
	

	service.getFreeTestTokens = function(token, addr) {
	    return new Promise(function(resolve, reject) {
		token.contract.showMeTheMoney(addr, 10000).then(function() {
		    resolve();
		});
	    });
	};
	
	// approves all tokens to hold in reserve
	service.approveReserve = function(token) {
	    return token.contract.approve(BondContract.address, token.balance);
	};
	
	
	service.prepareTokens = function(tokens) {
	    return _.map(tokens, function(t) {
		return {
		    name: t.name,
		    balance: 0,
		    price: 0.001, 
		    qnty: 0,
		    contract: t.contract
		};
	    });	
	};
	

	service.getTokens = function() {
	    return new Promise(function(resolve, reject) {
		BondService.getAccount().then(function(account) {
		    service.account = account;
		    var _tokens = service.prepareTokens([
			{contract: TST, name: "TST"},
			{contract: TST2, name: "TST2"},
		    ]);
		    
		    var promises = _.map(_tokens, service.getTokenBalance);

		    Promise.all(promises).then(function(tokens) {
			console.log("got toks here: ", tokens);
			resolve(tokens);
		    });
		});
	    });
	};


	//service.getTokens();
    });
