var BhuvToken = artifacts.require("./BhuvToken.sol");
var BhuvTokenSale = artifacts.require("./BhuvTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(BhuvToken, 1000000).then(function(){
    var tokenPrice= 1000000000000000;
    return deployer.deploy(BhuvTokenSale,BhuvToken.address,tokenPrice);

  });
 
}