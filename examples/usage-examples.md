# Usage Examples

This document shows how to use the `@noves/plugin-noves` in your ElizaOS agent.

## Installation

```bash
npm install @noves/plugin-noves
```

## Basic Setup

```typescript
import { novesPlugin } from '@noves/plugin-noves';

const agent = new Agent({
  // ... your agent configuration
  plugins: [novesPlugin],
});
```

## Available Actions

### 1. GET_RECENT_TXS - Wallet Activity Analysis

**Example Prompts:**
- "What was the activity of 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum?"
- "Show me recent transactions for 0x742d35Cc6634C0532925a3b8D5c3c5c1ee3E6C27 on polygon"
- "What happened with wallet 0x1234...5678 on arbitrum recently?"

**Expected Response:**
```
🔍 Recent activity for 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum:

1. **Swapped ETH for USDC**
   • Hash: 0x1234567890...
   • Time: 12/13/2025, 2:30:45 PM

2. **Approved USDC spending**
   • Hash: 0x9876543210...
   • Time: 12/13/2025, 2:25:12 PM
```

### 2. GET_TRANSLATED_TX - Transaction Analysis

**Example Prompts:**
- "What happened in 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6 on ethereum?"
- "Explain transaction 0xabcd...ef12 on base"
- "Help me understand this transaction: 0x1234...5678 on optimism"

**Expected Response:**
```
🔍 Transaction Analysis for 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6

📋 Description: Swapped 1.5 ETH for 3,240 USDC
⏰ Time: 12/13/2025, 2:30:45 PM
⛓️ Chain: ethereum
⛽ Gas Cost: 0.012450 ETH
🏷️ Type: DEX Trade
```

### 3. GET_TOKEN_PRICE - Token Price Information

**Example Prompts:**
- "What is the price of 0xae7ab96520de3a18e5e111b5eaab095312d7fe84 on ethereum?"
- "How much is token 0x1234...5678 worth on polygon?"
- "Show me the current price of 0xabcd...ef12 token on base"

**Expected Response:**
```
💰 Token Price Information

🏷️ Token: Lido Staked ETH (stETH)
📍 Address: 0xae7ab96520de3a18e5e111b5eaab095312d7fe84
⛓️ Chain: ethereum
💵 Price: $3,245.67 USD
⏰ Updated: Just now (Current)
💧 Liquidity: $1,250,000,000
🏪 Exchange: Curve Finance
```

## Supported Chains

- Ethereum (`ethereum`)
- Polygon (`polygon`) 
- Base (`base`)
- Arbitrum (`arbitrum`)
- Optimism (`optimism`)  
- Binance Smart Chain (`bsc`)

## Rate Limiting

The plugin includes built-in rate limiting:
- **30 requests per minute** maximum
- **2-second intervals** between requests
- Automatic backoff when limits are reached

## Error Handling

The plugin handles common errors gracefully:

- Invalid addresses → Clear error message
- Unsupported chains → Supported chain list
- API failures → Helpful fallback responses
- Rate limits → Automatic retry with backoff

## Advanced Usage

### Custom Integration

```typescript
import { 
  getRecentTxsAction, 
  getTranslatedTxAction, 
  getTokenPriceAction,
  extractBlockchainData,
  rateLimiter 
} from '@noves/plugin-noves';

// Use individual actions
const customAgent = new Agent({
  actions: [getRecentTxsAction, getTranslatedTxAction],
});

// Use utility functions
const data = extractBlockchainData("Send 1 ETH to 0x742d35Cc...");
console.log(data); // { addresses: ['0x742d35Cc...'], txHashes: [], chains: [] }

// Rate limiting
await rateLimiter.waitForNextRequest();
```

### Type Safety

```typescript
import type { 
  SupportedChain, 
  BlockchainData, 
  TokenPriceParams 
} from '@noves/plugin-noves';

const chain: SupportedChain = 'ethereum';
const params: TokenPriceParams = {
  chain: 'ethereum',
  token_address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84'
};
```

## Troubleshooting

### Common Issues

1. **No response from actions**
   - Ensure your prompt includes a valid address/transaction hash
   - Include the chain name in your message
   - Use supported keywords (activity, price, transaction, etc.)

2. **Rate limiting errors**
   - The plugin automatically handles rate limits
   - If you see persistent errors, check your API usage

3. **Invalid address format**
   - Addresses must be valid Ethereum format (0x + 40 hex characters)
   - Transaction hashes must be 0x + 64 hex characters

### Debug Mode

Enable detailed logging by setting the log level:

```typescript
import { logger } from '@elizaos/core';
logger.level = 'debug';
```

## Contributing

Visit our [GitHub repository](https://github.com/Noves-Inc/plugin-noves) to:
- Report issues
- Request features  
- Contribute code
- Read documentation

## Support

- 🌐 Website: [noves.fi](https://noves.fi)
- 📧 Email: info@noves.fi
- 🐛 Issues: [GitHub Issues](https://github.com/Noves-Inc/plugin-noves/issues) 