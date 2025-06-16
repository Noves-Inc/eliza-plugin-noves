# @noves/plugin-noves

ElizaOS plugin for blockchain data analysis using Noves Intents. This plugin enables AI agents to understand and explain blockchain transactions in human-readable language across multiple EVM-compatible chains.

## Description

The Noves plugin transforms complex blockchain data into clear, understandable insights. It leverages the Noves Intents to analyze transactions, wallet activity, and provide human-readable descriptions of on-chain activities. Perfect for AI agents that need to interact with blockchain data without requiring users to understand technical blockchain concepts.

## Features

* **Multi-chain Support**: Works across +100 chains like Ethereum, Polygon, Base, Arbitrum, Optimism, and BSC
* **Human-Readable Transactions**: Converts complex transaction data into plain English descriptions
* **Wallet Activity Analysis**: Get comprehensive wallet activity with transaction context
* **Transaction Details**: Detailed breakdown of individual transactions with classifications
* **Real-time Data**: Access to current blockchain state and recent transaction data


## Installation

```bash
npm install @noves/eliza-plugin-noves
```


## Usage

### Basic Setup

```typescript
import { novesPlugin } from '@noves/eliza-plugin-noves';

// Add to your ElizaOS character configuration
const character = {
  name: "BlockchainAnalyst",
  plugins: [novesPlugin],
  // ... other character config
};
```

### Example Interactions

#### Get Recent Wallet Activity

```
User: "What was the recent activity of 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum?"

Agent: "🔍 **Recent activity for 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum:**

1. **Swapped 0.5 ETH for 1,250 USDC on Uniswap**
   • Hash: 0x1234567890...
   • Time: 12/15/2024, 2:30:15 PM

2. **Received 100 USDT from 0x987654321...**
   • Hash: 0x0987654321...
   • Time: 12/15/2024, 1:15:22 PM

... and 3 more transactions."
```

#### Get Transaction Analysis

```
User: "Can you explain this transaction: 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6 on ethereum?"

Agent: "🔍 **Transaction Analysis for 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6**

📋 **Description:** Swapped 1.5 ETH for 3,240 USDC on Uniswap V3
⏰ **Time:** December 15, 2024 at 2:30:15 PM
⛓️ **Chain:** ethereum
⛽ **Gas Cost:** 0.003156 ETH
🏷️ **Type:** DeFi Swap

This transaction represents a decentralized exchange swap where the user traded Ethereum for USD Coin using the Uniswap V3 protocol."
```

#### Check Token Price

```
User: "What's the price of stETH token 0xae7ab96520de3a18e5e111b5eaab095312d7fe84 on ethereum?"

Agent: "💰 **Token Price Information**

🏷️ **Token:** Lido Staked ETH (stETH)
📍 **Address:** 0xae7ab96520de3a18e5e111b5eaab095312d7fe84
⛓️ **Chain:** ethereum
💵 **Price:** $3,245.67 USD
⏰ **Updated:** Just now (Current)
💧 **Liquidity:** $1,234,567,890
🏪 **Exchange:** Uniswap V3"
```

## Actions

### GET_RECENT_TXS

Retrieves recent transactions for a wallet address with human-readable descriptions using Noves Intents.

**Triggers:**
- "activity" + wallet address
- "recent transactions"
- "wallet history" 
- "what happened"
- "recent" + address

**Input:** Message containing wallet address and chain name

**Output:** List of up to 5 recent transactions with:
- Human-readable descriptions (e.g., "Swapped ETH for USDC")
- Truncated transaction hashes
- Formatted timestamps
- Total transaction count

**Example:**
```
User: "what was the activity of 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum?"

Response: "🔍 Recent activity for 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum:

1. Swapped ETH for USDC
   • Hash: 0x1234567890...
   • Time: 12/13/2025, 2:30:45 PM
   
... and 3 more transactions."
```

### GET_TRANSLATED_TX

Gets detailed human-readable analysis of a specific transaction using Noves translation capabilities.

**Triggers:**
- "transaction" + transaction hash
- "what happened" + hash
- "explain" + hash
- "understand" + hash
- "details" + hash

**Input:** Message containing transaction hash and chain name

**Output:** Detailed transaction analysis including:
- Human-readable description
- Timestamp
- Chain information
- Gas cost (when available)
- Transaction type/classification

**Example:**
```
User: "what happened in 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6 on ethereum?"

Response: "🔍 Transaction Analysis for 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6

📋 Description: Swapped 1.5 ETH for 3,240 USDC
⏰ Time: 12/13/2025, 2:30:45 PM
⛓️ Chain: ethereum
⛽ Gas Cost: 0.003156 ETH
🏷️ Type: DeFi Swap"
```

### GET_TOKEN_PRICE

Gets current or historical price information for any token using Noves pricing data.

**Triggers:**
- "price" + token address
- "value" + token address
- "cost" + token address
- "worth" + token address
- "usd" + token address

**Input:** Message containing token address and chain name

**Output:** Comprehensive token price information including:
- Token name and symbol
- Current/historical price in USD
- Token contract address
- Chain information
- Liquidity data (when available)
- Exchange information (when available)
- Historical context (if requested)

**Features:**
- **Current Prices**: Real-time token pricing
- **Historical Prices**: Supports queries like "price 30 days ago"
- **Multi-chain Support**: Works across all supported networks
- **Liquidity Context**: Shows liquidity pool information when available

**Example:**
```
User: "what is the price of the 0xae7ab96520de3a18e5e111b5eaab095312d7fe84 token on ethereum?"

Response: "💰 Token Price Information

🏷️ Token: Lido Staked ETH (stETH)
📍 Address: 0xae7ab96520de3a18e5e111b5eaab095312d7fe84
⛓️ Chain: ethereum
💵 Price: $3,245.67 USD
⏰ Updated: Just now (Current)
💧 Liquidity: $1,234,567,890
🏪 Exchange: Uniswap V3"
```

## Provider

The plugin includes a **NovesProvider** that:
- Processes blockchain data context for AI responses
- Formats transaction data for better readability
- Provides chain-specific information and context
- Handles multi-chain data normalization

## Error Handling

The plugin includes comprehensive error handling for:
- Invalid wallet addresses
- Unsupported chains
- Network connectivity issues
- Rate limiting
- API response errors

## Rate Limiting

Built-in rate limiting ensures responsible API usage:
- Maximum 30 requests per minute
- Minimum 2-second intervals between requests
- Automatic retry with exponential backoff

## Supported Address Formats

- **Ethereum addresses**: `0x` followed by 40 hexadecimal characters
- **Transaction hashes**: `0x` followed by 64 hexadecimal characters
- **ENS domains**: Automatically resolved to addresses where supported

## Troubleshooting

### Common Issues

**"Invalid address or chain" error:**
- Ensure the address starts with `0x` and is 42 characters long
- Verify the chain name is supported (ethereum, polygon, base, arbitrum, optimism, bsc)

**"No transactions found" response:**
- The wallet may be new or inactive
- Try a different chain where the wallet has activity
- Verify the address is correct

**Rate limiting messages:**
- The plugin automatically handles rate limits
- Wait for the rate limit window to reset (usually 1 minute)

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
DEBUG=noves:* npm start
```

## License

This plugin is part of the Noves ecosystem. See the LICENSE file for details.

## Additional information 

For more information about Noves capabilities:
* [Noves Documentation](https://docs.noves.fi/reference/api-overview)
* [Noves Intents](https://www.npmjs.com/package/@noves/intent-ethers-provider)
* [ElizaOS Documentation](https://elizaos.ai)
