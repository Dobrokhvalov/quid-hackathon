pragma solidity ^0.4.7;

import 'TST.sol';
import 'TST2.sol';

contract BondContract {

  uint[] public activeBondIds;
  uint public bondCounter;
  
  struct Bond {
    uint bondId;
    uint createdAt;
    address issuer;
    uint loanSum;
    uint percent;
    uint payout;
    uint loanDays;
    uint qntyToSale;
    uint reserveTokenQnty;
    address reserveToken;
    string reserveTokenSymbol;
    mapping(address => uint) holdersDct;
  }

  
  mapping (uint => Bond) bondDct;
  mapping(address => uint[]) issuerBondsDct;

  //  creditor bonds mapping
  mapping(address => uint[]) creditorBondsDct;

  
  
  // CONSTRUCTOR
  function BondContract() {
    bondCounter = 0;    
  }

  function issueBond(
		     uint loanSum,
		     uint percent,
		     uint payout,
		     uint loanDays,
		     uint reserveTokenQnty,
		     address reserveToken,
		     string reserveTokenSymbol
) returns (bool ok) {
    
    bondDct[bondCounter] = Bond({
      bondId: bondCounter,
	  createdAt: now,
	  issuer: msg.sender,
	  loanSum: loanSum,
	  percent: percent,
	  payout: payout,
	  loanDays: loanDays,
	  qntyToSale: 100, // 100 bonds issued
	  reserveTokenQnty: reserveTokenQnty,
	  reserveToken: reserveToken,
	  reserveTokenSymbol: reserveTokenSymbol
      });

    // call ERC TOKEN to change owner
    if (sha3(reserveTokenSymbol) == sha3("TST")) {
      TST tokenTST = TST(reserveToken);
      if (tokenTST.transferFrom.gas(300000)(msg.sender, this, reserveTokenQnty) != true) {
	throw;
      }
    } else if (sha3(reserveTokenSymbol) == sha3("TST2")) {
      TST2 tokenTST2 = TST2(reserveToken);
      if (tokenTST2.transferFrom.gas(300000)(msg.sender, this, reserveTokenQnty) != true) {
	throw;
      }
    } else throw;
	     
    
    // save bond to mappings
    issuerBondsDct[msg.sender].push(bondCounter);
    activeBondIds.push(bondCounter);
    bondCounter =  bondCounter + 1;
    
    return true;
  }


  // return users counter and last id
  function getBonds() constant returns (uint[]) {
    return activeBondIds;
  }


  
  /* function getUserVersuses() constant returns (uint[]) { */
  /*   return (authorMapping[msg.sender]); */
  /* } */

  function getBond(uint bondId) constant returns (uint, uint, uint, uint, uint, uint, uint, string) {
    Bond bond = bondDct[bondId];

    return (
	    bond.loanSum,
	    bond.percent,
	    bond.loanDays,
	    bond.payout,
	    bond.createdAt,
	    bond.qntyToSale,  // bonds left to buy
	    bond.reserveTokenQnty,
	    bond.reserveTokenSymbol
	    );
  }

  
  function buyBond(uint bondId, uint qnty) payable returns (bool ok) {
    Bond bond = bondDct[bondId];
    
    uint sumToPay = bond.loanSum * (qnty/100);
    if (sumToPay < msg.value) throw; // not enough money
    
    // lend money to borrower
    if (bond.issuer.send(sumToPay)){

      // add msg sendor to bond holders
      bond.holdersDct[msg.sender] = qnty;

      
      return true;
    }  else {
      return false;
    }


    
  }
  
  
}
