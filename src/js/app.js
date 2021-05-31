App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,


    init: function () {
        console.log("App intialized...")
        return App.initWeb3();
    },
    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
       
        return App.initContracts();
    },

    initContracts: function () {
        $.getJSON("BhuvTokenSale.json", function (bhuvTokenSale) {
            App.contracts.BhuvTokenSale = TruffleContract(bhuvTokenSale);

            App.contracts.BhuvTokenSale.setProvider(App.web3Provider);
            App.contracts.BhuvTokenSale.deployed().then(function (bhuvTokenSale) {

                console.log("BhuvTokenSale address :", bhuvTokenSale.address);
            })
        }).done(function () {
            $.getJSON("BhuvToken.json", function (bhuvToken) {
                App.contracts.BhuvToken = TruffleContract(bhuvToken);
                App.contracts.BhuvToken.setProvider(App.web3Provider);
                App.contracts.BhuvToken.deployed().then(function (bhuvToken) {
                    console.log("BhuvToken ADDRESS : ", bhuvToken.address)

                })
                App.listenForEvents();
                return App.render();

            })

        })
    },



    listenForEvents : function() {
App.contracts.BhuvTokenSale.deployed().then(function(instance){

    instance.Sell({} , {

        fromBlock: 0,
        toBlock : "latest",
    }).watch(function(error,event){

        console.log("event triggered", event);
        App.render();
    })
})

    },

    render: function () {
        if (App.loading) {
            return;
        }
        App.loading = true;
        var loader = $('#loader');
        var content = $('#content');
        loader.show();
        content.hide();
        web3.eth.getCoinbase(function (err, account) {

            if (err == null) {
                App.account = account;

                $('#account-address').html("Your Account : " + account)
                    ;
            }

        })


        App.contracts.BhuvTokenSale.deployed().then(function (instance) {
            bhuvTokenSaleInstance = instance;
            return bhuvTokenSaleInstance.tokenPrice();
        }).then(function (tokenPrice) {
            App.tokenPrice = tokenPrice;
            $(".token-price").html(web3.fromWei(App.tokenPrice.toNumber()));
            return bhuvTokenSaleInstance.tokensSold();
        }).then(function (tokensSold) {

            App.tokensSold = tokensSold.toNumber();
            $(".tokens-sold").html(App.tokensSold);
            $(".tokens-available").html(App.tokensAvailable);

            var progressPercent = (App.tokensSold / App.tokensAvailable);
            $("#progress").css('width', progressPercent + "%")

            App.contracts.BhuvToken.deployed().then(function (instance) {
                bhuvTokenInstance = instance;
                return bhuvTokenInstance.balanceOf(App.account);
            }).then(function (balance) {

                $(".bhuv-balance").html(balance.toNumber());

                App.loading = false;
                loader.hide();
                content.show();


            })

        })



        

    },

    buyTokens : function() {
$("#content").hide();
$("#loader").show();
var numberOfToken= $("#numberOfToken").val();
App.contracts.BhuvTokenSale.deployed().then(function(instance){
    return instance.buyTokens(numberOfToken, { 
        from : App.account,
        value : numberOfToken* App.tokenPrice,
        gas : 500000
    });
}).then(function(result){

    console.log("tokens bought....")
    $("form").trigger("reset");
   
})

    }



}

$(function () {

    $(window).load(function () {
        App.init();
    })

});