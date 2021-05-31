var BhuvToken = artifacts.require("./BhuvToken.sol");
var BhuvTokenSale = artifacts.require("./BhuvTokenSale.sol");


contract('BhuvTokenSale', function (accounts) {
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000;
    var tokensAvailable = 750000;
    var numberOfTokens;

    it("set correct Values", function () {

        return BhuvTokenSale.deployed().then(function (instance) {
            tokenInstance = instance;
        }).then(function (instance) {
            return tokenInstance.address;
        }).then(function (address) {
            assert.notEqual(address, 0x0, "has contract address");
            return tokenInstance.tokenContract();
        }).then(function (address) {
            assert.notEqual(address, 0x0, " has token contract address");
            return tokenInstance.tokenPrice();
        }).then(function (price) {

            assert.equal(price, tokenPrice, "token price is correct");
        })
    })


    it("fecilitates token buying ", function () {

        return BhuvToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return BhuvTokenSale.deployed();
        }).then(function (instance) {
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then(function (receipt) {

            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: tokenPrice * numberOfTokens })



        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, "triggers 1 event");
            assert.equal(receipt.logs[0].event, "Sell", "triggers sell event");
            assert.equal(receipt.logs[0].args._buyer, buyer, "triggers 1 event");
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, "triggers 1 event");
            return tokenSaleInstance.tokensSold();
        }).then(function (amount) {
            assert.equal(amount.toNumber(), numberOfTokens, "increments the number of token sold");
            return tokenInstance.balanceOf(buyer);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenInstance.address);

        }).then(function (balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf("revert") >= 0, "msg.value must be equal to number of ethers in wei");
            return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(assert.fail).catch(function (error) {

            assert(error.message.indexOf("revert") >= 0, "cannot purchase more than avail")
        })


    })


    it("ends token sale", function () {

        return BhuvToken.deployed().then(function (instance) {

            tokenInstance = instance;
            return BhuvTokenSale.deployed();

        }).then(function (instance) {

            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function (error) {

            assert(error.message.indexOf("revert") >= 0, "must be admin to end sale");
            return tokenSaleInstance.endSale({ from: admin });
        }).then(function (receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function (balance) {

            assert.equal(balance.toNumber(), 999990, "returns al unsod tokens to admin");
            web3.eth.getBalance(tokenSaleInstance.address)
                .then(balance => {
                    // You can use balance here
                    console.log(balance);
                })
                .catch(console.error);
        })

    })

})

