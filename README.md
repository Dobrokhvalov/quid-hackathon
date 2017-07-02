
## Summary of the project and the problem you are solving

QuidTrade is Ethereum dApp which connects directly creditors and borrowers through smart-contracts.

Platform offers debt trading with bonds. Creditor risk is backed by borrowers' reserve tokens (ERC20).

Creditor is able to diversify risks by choosing bonds with different collateral. 

## Available On Ropsten (+ video demo)

Demo Video - https://screencast-o-matic.com/watch/cbinIjllnb

The dApp is deployed to Ropsten Testnet - https://dobrokhvalov.github.io/quid-hackathon/dist/index.html

To interact with dApp you need access to web3 client (MetaMask, Geth or other) 

## Brief background on the team and how you came up with idea

Mikhail Dobrokhvalov - blockchain developer / finance - https://www.facebook.com/dobrokhvalov

Andrey Krylov - leader / design - https://www.facebook.com/kryptonlove

Idea came up when our blockchain developer wanted more Ether to buy more SNT tokens. He believes the price of SNT in future will grow.

## How is it innovative?

Existing lending platforms (such as lendingclub.com) don't use blockchain. Our platform based on Ethereum, which reduces costs for maintaining webservers.

Also the loan is secured by the borrower's tokens. In the event that the borrower doesn't pay out his debt creditor receives reserve tokens.


## What tool(s) / platform(s) do you use?

Embark - framework for serverless Decentralized Applications using Ethereum, IPFS and other platforms

AngularJS - Front-end Javascript Framework


## What was the biggest obstacle that your team overcame?

We planned to deploy our dApp to QTum Sparknet. 
Unfortunately, due to lack of time and lack of expereince of our team with Bitcoin Blockchain, we didn't managed to deliver dApp on QTum.
However, we will look for more documentation in future for QTum development.

## Code Structure

'./app' - all dApp specific code is located in this folder. 

'./app/contracts' - Ethereum Contracts are located here, 'BondContract.sol' is the main contract.

'./app/js/services/BondService.js' - service responsible for integration of 'BondContract.sol' with AngularJS app. 


## Local Deployment (Mac OS X and Linux)

1. Install Embark framework via terminal : 

Requirements: geth (1.6.5 or higher recommended, 1.6.0 or lower for whisper support), node (6.9.1 or higher is recommended) and npm
```Bash
$ npm -g install embark
$ npm -g install ethereumjs-testrpc
```

See [Complete Installation Instructions](https://github.com/iurimatias/embark-framework/wiki/Installation).

2. Clone this project
```Bash
git clone https://github.com/Dobrokhvalov/quid-hackathon.git
```
3. Go to project directory and run embark simulator: 
```Bash
cd quid-hackathon && embark simulator
```
Simulator will generate private keys with test Ether. Import one of accounts to your web3 client in order to interact with dApp.


4. In separate tab, start embark server: 
```Bash
embark run
```
This command will serve dApp on localhost:8000









