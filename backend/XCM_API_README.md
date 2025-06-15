# Polkadot XCM Backend API

This backend provides RESTful API endpoints for interacting with Polkadot XCM (Cross-Consensus Message) functionality, enabling cross-parachain token transfers and HRMP channel management.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Running Polkadot relay chain and parachains (via zombienet)
- Updated chain_spec.json files with `para_id` and `relay_chain` fields

### Installation
```bash
cd backend
npm install
npm start
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/xcm
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/init` | Initialize API connections |
| POST | `/hrmp/open` | Open HRMP channel |
| POST | `/hrmp/accept` | Accept HRMP channel |
| POST | `/hrmp/setup-bidirectional` | Setup bidirectional channels |
| POST | `/transfer` | Transfer tokens via XCM |
| GET | `/balance/:paraId/:address` | Get account balance |
| GET | `/balances/:paraId` | Get all test account balances |

---

## 🔧 API Endpoints

### 1. Initialize Connections
Initialize WebSocket connections to relay chain and parachains.

**POST** `/api/xcm/init`

**Response:**
```json
{
  "success": true,
  "message": "XCM connections initialized",
  "endpoints": {
    "relayChain": "ws://127.0.0.1:9944",
    "parachain1000": "ws://127.0.0.1:9946", 
    "parachain1001": "ws://127.0.0.1:9947"
  }
}
```

---

### 2. Open HRMP Channel
Open a unidirectional HRMP channel between parachains.

**POST** `/api/xcm/hrmp/open`

**Body:**
```json
{
  "srcParaId": 1000,
  "destParaId": 1001,
  "maxCapacity": 8,
  "maxMessageSize": 1024
}
```

**Parameters:**
- `srcParaId` (required): Source parachain ID
- `destParaId` (required): Destination parachain ID  
- `maxCapacity` (optional): Max messages in queue (default: 8)
- `maxMessageSize` (optional): Max message size in bytes (default: 1024)

**Response:**
```json
{
  "success": true,
  "blockHash": "0x...",
  "events": ["hrmp.OpenChannelRequested"],
  "message": "HRMP channel initiated from 1000 to 1001"
}
```

---

### 3. Accept HRMP Channel
Accept an incoming HRMP channel request.

**POST** `/api/xcm/hrmp/accept`

**Body:**
```json
{
  "srcParaId": 1000
}
```

**Parameters:**
- `srcParaId` (required): Parachain ID that initiated the channel

**Response:**
```json
{
  "success": true,
  "blockHash": "0x...",
  "events": ["hrmp.OpenChannelAccepted"],
  "message": "HRMP channel accepted from 1000"
}
```

---

### 4. Setup Bidirectional Channels
Automatically setup bidirectional HRMP channels between two parachains.

**POST** `/api/xcm/hrmp/setup-bidirectional`

**Body:**
```json
{
  "paraId1": 1000,
  "paraId2": 1001,
  "maxCapacity": 8,
  "maxMessageSize": 1024
}
```

**Parameters:**
- `paraId1` (required): First parachain ID
- `paraId2` (required): Second parachain ID
- `maxCapacity` (optional): Max messages in queue (default: 8)
- `maxMessageSize` (optional): Max message size in bytes (default: 1024)

**Response:**
```json
{
  "success": true,
  "channels": {
    "1000to1001": { "success": true, "blockHash": "0x..." },
    "1001to1000": { "success": true, "blockHash": "0x..." },
    "accept1000": { "success": true, "blockHash": "0x..." },
    "accept1001": { "success": true, "blockHash": "0x..." }
  },
  "message": "Bidirectional HRMP channels established between 1000 and 1001"
}
```

---

### 5. Transfer Tokens via XCM
Transfer tokens between parachains using XCM.

**POST** `/api/xcm/transfer`

**Body:**
```json
{
  "srcParaId": 1000,
  "destParaId": 1001,
  "amount": "1000000000000",
  "tokenSymbol": "UNIT",
  "senderKey": "//Alice",
  "recipient": null
}
```

**Parameters:**
- `srcParaId` (required): Source parachain ID
- `destParaId` (required): Destination parachain ID
- `amount` (required): Amount in smallest unit (12 decimals for UNIT)
- `tokenSymbol` (optional): Token symbol (default: "UNIT")
- `senderKey` (optional): Sender account key (default: "//Alice")
- `recipient` (optional): Recipient address (defaults to sender)

**Amount Examples:**
- `"1000000000000"` = 1 UNIT (12 decimals)
- `"500000000000"` = 0.5 UNIT
- `"100000000000"` = 0.1 UNIT

**Response:**
```json
{
  "success": true,
  "blockHash": "0x...",
  "events": ["xTokens.Transferred", "xcmpQueue.XcmpMessageSent"],
  "transfer": {
    "from": 1000,
    "to": 1001,
    "amount": "1000000000000",
    "token": "UNIT",
    "sender": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
  }
}
```

---

### 6. Get Account Balance
Get the balance of a specific account on a parachain.

**GET** `/api/xcm/balance/:paraId/:address`

**Parameters:**
- `paraId`: Parachain ID (1000 or 1001)
- `address`: Account address

**Response:**
```json
{
  "paraId": 1000,
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "free": "1000000000000000",
  "reserved": "0",
  "miscFrozen": "0",
  "feeFrozen": "0"
}
```

---

### 7. Get All Test Account Balances
Get balances for all test accounts (Alice, Bob, Charlie, etc.) on a parachain.

**GET** `/api/xcm/balances/:paraId`

**Parameters:**
- `paraId`: Parachain ID (1000 or 1001)

**Response:**
```json
{
  "paraId": 1000,
  "balances": [
    {
      "name": "Alice",
      "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "free": "1000000000000000",
      "reserved": "0",
      "miscFrozen": "0",
      "feeFrozen": "0"
    },
    {
      "name": "Bob",
      "address": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      "free": "1000000000000000",
      "reserved": "0",
      "miscFrozen": "0", 
      "feeFrozen": "0"
    }
  ]
}
```

---

## 💰 Token Amount Conversion

### UNIT Token (12 decimals)
- 1 UNIT = `1000000000000` (smallest unit)
- 0.1 UNIT = `100000000000`
- 0.01 UNIT = `10000000000`

### JavaScript Helper Functions
```javascript
// Convert human readable to smallest unit
function toSmallestUnit(amount, decimals = 12) {
  return (parseFloat(amount) * Math.pow(10, decimals)).toString();
}

// Convert smallest unit to human readable
function fromSmallestUnit(amount, decimals = 12) {
  return (parseFloat(amount) / Math.pow(10, decimals)).toString();
}

// Examples
toSmallestUnit("1.5")      // "1500000000000"
fromSmallestUnit("1500000000000") // "1.5"
```

---

## 🔗 HRMP Channel Parameters

### maxCapacity (default: 8)
- Maximum number of messages that can be queued in the channel
- If queue is full, new messages will be rejected
- Recommended: 8-32 for testing, higher for production

### maxMessageSize (default: 1024)
- Maximum size of a single XCM message in bytes
- Larger messages cost more to send
- Recommended: 1024-4096 bytes

---

## 🔥 Example Usage Workflows

### Complete XCM Transfer Workflow

1. **Initialize connections:**
```bash
curl -X POST http://localhost:3001/api/xcm/init
```

2. **Setup bidirectional channels:**
```bash
curl -X POST http://localhost:3001/api/xcm/hrmp/setup-bidirectional \
  -H "Content-Type: application/json" \
  -d '{
    "paraId1": 1000,
    "paraId2": 1001,
    "maxCapacity": 8,
    "maxMessageSize": 1024
  }'
```

3. **Check initial balances:**
```bash
curl http://localhost:3001/api/xcm/balances/1000
curl http://localhost:3001/api/xcm/balances/1001
```

4. **Transfer 1 UNIT from para 1000 to 1001:**
```bash
curl -X POST http://localhost:3001/api/xcm/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "srcParaId": 1000,
    "destParaId": 1001,
    "amount": "1000000000000",
    "tokenSymbol": "UNIT",
    "senderKey": "//Alice"
  }'
```

5. **Verify transfer:**
```bash
curl http://localhost:3001/api/xcm/balances/1000
curl http://localhost:3001/api/xcm/balances/1001
```

---

## ⚠️ Error Handling

### Common Error Responses

**Invalid parachain ID:**
```json
{
  "success": false,
  "error": "Unsupported parachain ID: 1002"
}
```

**Connection failed:**
```json
{
  "success": false,
  "error": "Failed to initialize connections: connection refused"
}
```

**HRMP channel error:**
```json
{
  "success": false,
  "error": "hrmp.OpenChannelAlreadyExists: Channel already exists"
}
```

**Transfer failed:**
```json
{
  "success": false,
  "error": "xTokens.TooExpensive: Transfer fee too high"
}
```

---

## 🛠 Development & Testing

### Prerequisites
1. **Start zombienet with relay chain and parachains:**
   ```bash
   zombienet spawn zombienet-config.toml
   ```

2. **Ensure parachains have updated chain_spec.json with:**
   - `"para_id": 1000` (or 1001)
   - `"relay_chain": "rococo-local"`

3. **Start the backend server:**
   ```bash
   cd backend
   npm install
   npm start
   ```

### Testing Endpoints
Use the included test scripts or tools like curl/Postman to test the endpoints.

---

## 📋 Configuration

### Default Network Endpoints
- **Relay Chain**: `ws://127.0.0.1:9944`
- **Parachain 1000**: `ws://127.0.0.1:9946`
- **Parachain 1001**: `ws://127.0.0.1:9947`

### Test Accounts
- Alice: `//Alice`
- Bob: `//Bob`
- Charlie: `//Charlie`
- Dave: `//Dave`
- Eve: `//Eve`
- Ferdie: `//Ferdie`

---

## 🔍 Monitoring & Debugging

### Check API Status
```bash
curl http://localhost:3001/health
```

### View API Documentation
```bash
curl http://localhost:3001/
```

### Monitor Console Logs
The server provides detailed console logging for all XCM operations, including:
- Connection status
- Transaction submissions
- Block confirmations
- Event parsing
- Error details

---

This API provides a complete foundation for building XCM-enabled applications on Polkadot parachains! 🚀 