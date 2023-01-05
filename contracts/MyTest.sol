// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import hardhat console
import "hardhat/console.sol";

contract MyTest {
  uint256 public unlockedTime;
  address payable public owner;

  event Widthrawal(uint256 amount, uint256 when);

  constructor(uint256 _unlockedTime) payable {
    require(block.timestamp < _unlockedTime, "Unlock time should be in future");

    unlockedTime = _unlockedTime;
    owner = payable(msg.sender);
  }

  function withdrawal() public {
    require(block.timestamp >= unlockedTime, "Wait till the time period completes");
    require(msg.sender == owner, "You are not the owner");

    emit Widthrawal(address(this).balance, block.timestamp);

    owner.transfer(address(this).balance);
  }
}