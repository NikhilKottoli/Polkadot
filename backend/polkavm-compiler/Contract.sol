// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
contract Storage {
  uint256 number;
  function store(uint256 _num) public {
    number = _num;
  }
  function retrieve() public view returns (uint256) {
    return number;
  }
}