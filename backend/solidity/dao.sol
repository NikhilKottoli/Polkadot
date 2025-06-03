// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleDAO {
    mapping(address => bool) public hasVoted;
    uint public yesVotes;
    uint public totalVotes;

    uint public voteDeadline;

    constructor(uint durationInSeconds) {
        voteDeadline = block.timestamp + durationInSeconds;
    }

    function voteYes() external {
        require(block.timestamp < voteDeadline, "Voting closed");
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        yesVotes++;
        totalVotes++;
    }

    function voteNo() external {
        require(block.timestamp < voteDeadline, "Voting closed");
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        totalVotes++;
    }

    function votePassed() public view returns (bool) {
        if (totalVotes == 0) return false;
        return yesVotes * 100 / totalVotes >= 50;
    }
}
