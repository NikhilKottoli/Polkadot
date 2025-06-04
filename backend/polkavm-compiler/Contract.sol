// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract MyToken {
    // Token properties
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    // Owner of the contract
    address public owner;

    // Mapping of balances
    mapping(address => uint256) public balances;

    // Mapping of allowances
    mapping(address => mapping(address => uint256)) public allowances;

    // Mapping of authorized addresses
    mapping(address => bool) public authorized;

    // Reentrancy guard
    bool private _locked;

    // Pausable state
    bool public paused;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    // Constructor
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
        totalSupply = _initialSupply;
        balances[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    // Transfer function
    function transfer(address _to, uint256 _value) public nonReentrant whenNotPaused returns (bool success) {
        require(balances[msg.sender] >= _value, "Insufficient balance");
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Approve function
    function approve(address _spender, uint256 _value) public nonReentrant whenNotPaused returns (bool success) {
        allowances[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // TransferFrom function
    function transferFrom(address _from, address _to, uint256 _value) public nonReentrant whenNotPaused returns (bool success) {
        require(balances[_from] >= _value, "Insufficient balance");
        require(allowances[_from][msg.sender] >= _value, "Insufficient allowance");
        balances[_from] -= _value;
        balances[_to] += _value;
        allowances[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    // Mint function
    function mint(address _to, uint256 _value) public onlyOwner nonReentrant whenNotPaused {
        totalSupply += _value;
        balances[_to] += _value;
        emit Mint(_to, _value);
    }

    // Burn function
    function burn(uint256 _value) public nonReentrant whenNotPaused {
        require(balances[msg.sender] >= _value, "Insufficient balance");
        totalSupply -= _value;
        balances[msg.sender] -= _value;
        emit Burn(msg.sender, _value);
    }

    // Pause function
    function pause() public onlyOwner {
        paused = true;
    }

    // Unpause function
    function unpause() public onlyOwner {
        paused = false;
    }
}