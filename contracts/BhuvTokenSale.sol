pragma solidity ^0.5.16;

import "./BhuvToken.sol";

contract BhuvTokenSale {
    BhuvToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    address payable admin;

    event Sell(address _buyer, uint256 _amount);

    constructor(BhuvToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberofTokens) public payable {
        require(msg.value == multiply(_numberofTokens, tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberofTokens);
        require(tokenContract.transfer(msg.sender, _numberofTokens));
        tokensSold += _numberofTokens;
        emit Sell(msg.sender, _numberofTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );

      admin.transfer(address(this).balance);
    }
}
