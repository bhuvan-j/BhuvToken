const _deploy_contracts = require("../migrations/2_deploy_contracts")

var BhuvToken = artifacts.require("./BhuvToken.sol")

contract("BhuvToken", function (accounts) {
    var tokenInstance;

    it("intialises he contract with correct vals", function () {
        return BhuvToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function (name) {
            assert.equal(name, "BhuvToken", "has the correct namme");
            return tokenInstance.symbol();
        }).then(function (symbol) {
            assert.equal(symbol, "BJC", "has correct symbol")
            return tokenInstance.standard();
        }).then(function (standard) {
            assert.equal(standard, "BhuvToken v1.0", "has the correct standard")
        });
    })
    it("sets the total supply upon deployment", function () {

        return BhuvToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1M');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (adminbalance) {
            assert.equal(adminbalance.toNumber(), 1000000, 'it allocates initial supply to admin acount')
        })

    })


    it("transfers token ownership", function () {

        return BhuvToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 9999999999999);
        }).then(assert.fail).catch(function (error) {

            assert(error.message.indexOf("revert") >= 0, "error message must contan revert");
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function (success) {
            assert.equal(success, true, "returns true");
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, "triggers 1 event");
            assert.equal(receipt.logs[0].event, "Transfer", "triggers transfer event");
            assert.equal(receipt.logs[0].args._from, accounts[0], "triggers 1 event");
            assert.equal(receipt.logs[0].args._to, accounts[1], "triggers 1 event");
            assert.equal(receipt.logs[0].args._value, 250000, "triggers 1 event");
            return tokenInstance.balanceOf(accounts[1]);

        }).then(function (balance) {
            assert.equal(balance.toNumber(), 250000, "adds amount to reviecing acount");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 750000, "deducts amount from sender account");
        })
    })



    it("approves tokens for delegated transfer", function () {

        return BhuvToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function (success) {
            assert.equal(success, true, "returns true");
            return tokenInstance.approve(accounts[1], 100);
        }).then(function (receipt) {

            assert.equal(receipt.logs.length, 1, "triggers 1 event");
            assert.equal(receipt.logs[0].event, "Approval", "triggers transfer event");
            assert.equal(receipt.logs[0].args._owner, accounts[0], "triggers 1 event");
            assert.equal(receipt.logs[0].args._spender, accounts[1], "triggers 1 event");
            assert.equal(receipt.logs[0].args._value, 100, "triggers 1 event");

            return tokenInstance.allowance(accounts[0], accounts[1]);



        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 100, "stores allowance");
        })

    })

    it("handles delegated token transfer", function () {
        return BhuvToken.deployed().then(function (instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];

            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });


        }).then(function (receipt) {

            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function (receipt) {

            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
        }).then(assert.fail).catch(function (error) {

            assert(error.message.indexOf("revert") >= 0, "cannot transfer value larger than balance");
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf("revert") >= 0, "cannot transfer value larger than approved balance");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function (success) {
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount,toAccount,10, {from: spendingAccount});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "triggers 1 event");
            assert.equal(receipt.logs[0].event, "Transfer", "triggers transfer event");
            assert.equal(receipt.logs[0].args._from, fromAccount, "triggers 1 event");
            assert.equal(receipt.logs[0].args._to, toAccount, "triggers 1 event");
            assert.equal(receipt.logs[0].args._value, 10, "triggers 1 event");
return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(),90,"deducts from sending account");
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(),10,"adds to receiver account");
            return tokenInstance.allowance(fromAccount,spendingAccount);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(),0,"deducts allowance")
        })

    });

});

