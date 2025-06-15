# 🚀 XCM API Documentation - Hackathon Demo

## Base URL
```
http://localhost:3000/api/xcm
```

## 🎯 Core Endpoints for Demo

### 1. Initialize XCM Connections
**Check if parachains are online and connected**

```http
POST /api/xcm/init
Content-Type: application/json

{}
```

**Response:**
```json
{
  "success": true,
  "message": "XCM connections initialized successfully",
  "connections": {
    "relayChain": true,
    "parachain1000": true,
    "parachain1001": true
  },
  "endpoints": {
    "RELAY_CHAIN_WS": "ws://127.0.0.1:9944",
    "PARACHAIN_1000_WS": "ws://127.0.0.1:9946",
    "PARACHAIN_1001_WS": "ws://127.0.0.1:9947"
  }
}
```

### 2. Check Connection Status
**Verify which chains are connected**

```http
GET /api/xcm/status
```

**Response:**
```json
{
  "success": true,
  "allConnected": true,
  "connections": {
    "relayChain": true,
    "parachain1000": true,
    "parachain1001": true
  },
  "readyForDemo": true,
  "message": "All chains connected - Ready for XCM operations!"
}
```

### 3. Open HRMP Channels (Bidirectional)
**Establish communication channels between parachains**

```http
POST /api/xcm/hrmp/open-bidirectional
Content-Type: application/json

{
  "sudoSeed": "//Alice"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bidirectional HRMP channels opened successfully",
  "channels": {
    "1000to1001": {
      "open": "0x1234567890abcdef...",
      "accept": "0xabcdef1234567890..."
    },
    "1001to1000": {
      "open": "0xfedcba0987654321...",
      "accept": "0x0987654321fedcba..."
    }
  },
  "parameters": {
    "maxCapacity": 8,
    "maxMessageSize": 1024
  }
}
```

### 4. Execute XCM Transfer
**Transfer tokens between parachains**

```http
POST /api/xcm/transfer
Content-Type: application/json

{
  "fromPara": 1000,
  "toPara": 1001,
  "amount": "1000000000000",
  "accountSeed": "//Alice",
  "asset": "UNIT"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0xabcdef1234567890...",
  "fromPara": 1000,
  "toPara": 1001,
  "amount": "1000000000000",
  "asset": "UNIT",
  "sender": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "xcmInstructions": ["WithdrawAsset", "BuyExecution", "DepositAsset"],
  "multiLocation": {
    "parents": 1,
    "interior": {
      "X1": {
        "Parachain": 1001
      }
    }
  }
}
```

### 5. Check Account Balance
**Verify transfer success by checking balance**

```http
GET /api/xcm/balance/1001/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

**Response:**
```json
{
  "success": true,
  "parachain": "1001",
  "account": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "balance": "1000000000000000",
  "balanceFormatted": "1000.0000 UNIT"
}
```

## 🎪 Perfect Demo Flow

### Step 1: Check Connections
```bash
GET /api/xcm/status
```
**Show:** Live connection status to all chains

### Step 2: Initialize if Needed
```bash
POST /api/xcm/init
```
**Show:** Connecting to relay chain and both parachains

### Step 3: Open Communication Channels
```bash
POST /api/xcm/hrmp/open-bidirectional
```
**Show:** Real transaction hashes for channel setup

### Step 4: Execute Cross-Chain Transfer
```bash
POST /api/xcm/transfer
{
  "fromPara": 1000,
  "toPara": 1001,
  "amount": "1000000000000",
  "asset": "UNIT"
}
```
**Show:** Actual blockchain transaction with hash

### Step 5: Verify Transfer Success
```bash
GET /api/xcm/balance/1001/[alice-address]
```
**Show:** Updated balance on destination chain

## 🔧 Technical Implementation

### HRMP Channel Parameters
- **maxCapacity**: 8 (max messages in queue)
- **maxMessageSize**: 1024 (max bytes per message)

### XCM MultiLocation Format
```json
{
  "V3": {
    "parents": 1,
    "interior": {
      "X1": {
        "Parachain": 1001
      }
    }
  }
}
```

### XCM Instructions Executed
1. **WithdrawAsset** - Remove tokens from sender
2. **BuyExecution** - Pay for cross-chain execution
3. **DepositAsset** - Deposit tokens to recipient

## 🎯 Demo Highlights

✅ **Real Blockchain Integration** - Not simulation  
✅ **Live Transaction Hashes** - Verifiable on-chain  
✅ **Cross-Chain Communication** - Actual parachain-to-parachain  
✅ **Automated Channel Management** - One-click setup  
✅ **Balance Verification** - Proof of successful transfer  
✅ **Telegram Notifications** - Real-time updates  

## 🏆 Ready for Hackathon!

Your API demonstrates:
- **Complex XCM operations** made simple
- **Real blockchain transactions** 
- **Production-ready implementation**
- **Developer-friendly interface**
- **Complete cross-chain workflow** 