# 🧪 Manual Test Commands for XCM API

## Prerequisites
- Your server is running: `node server.js`
- Your parachains are running via omni
- Server accessible at: `http://localhost:3000`

## Test Commands (Copy & Paste)

### 1. Check XCM Status
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/xcm/status" -Method GET
```

### 2. Initialize XCM Connections
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/xcm/init" -Method POST -ContentType "application/json" -Body "{}"
```

### 3. Check Status After Init
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/xcm/status" -Method GET
```

### 4. Open HRMP Channels (Bidirectional)
```powershell
$body = @{
    sudoSeed = "//Alice"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/xcm/hrmp/open-bidirectional" -Method POST -ContentType "application/json" -Body $body
```

### 5. Execute XCM Transfer (Para 1000 → Para 1001)
```powershell
$transferBody = @{
    fromPara = 1000
    toPara = 1001
    amount = "1000000000000"
    accountSeed = "//Alice"
    asset = "UNIT"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/xcm/transfer" -Method POST -ContentType "application/json" -Body $transferBody
```

### 6. Execute Reverse Transfer (Para 1001 → Para 1000)
```powershell
$reverseBody = @{
    fromPara = 1001
    toPara = 1000
    amount = "500000000000"
    accountSeed = "//Alice"
    asset = "UNIT"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/xcm/transfer" -Method POST -ContentType "application/json" -Body $reverseBody
```

### 7. Check Balance on Parachain 1001
```powershell
# Replace with actual Alice address from transfer response
Invoke-WebRequest -Uri "http://localhost:3000/api/xcm/balance/1001/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" -Method GET
```

## Expected Results

### ✅ Success Indicators:
- Status shows `"allConnected": true`
- HRMP channels return transaction hashes
- Transfers return transaction hashes
- Balance checks show updated amounts
- Telegram notifications appear

### ⚠️ Expected Issues:
- If parachains not running: Connection failures
- If channels already exist: HRMP errors (normal)
- If no funds: Transfer failures

## 🎯 For Hackathon Demo

**Show these live during presentation:**

1. **API Status** → "All chains connected!"
2. **Channel Setup** → Real transaction hashes
3. **Token Transfer** → Live blockchain transaction
4. **Balance Verification** → Proof of success
5. **Telegram Notification** → Real-time updates

## 🏆 Demo Success Criteria

✅ API responds to all endpoints  
✅ Connections established to parachains  
✅ HRMP channels can be managed  
✅ XCM transfers execute successfully  
✅ Transaction hashes are real  
✅ Balances update correctly  

**You're ready for your hackathon presentation! 🚀** 