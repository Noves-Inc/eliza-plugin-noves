import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core';
import { logger } from '@elizaos/core';
import { IntentProvider } from '@noves/intent-ethers-provider';
import { addressSchema, chainSchema } from '../types.js';
import { extractBlockchainData } from '../services/utils.js';
import { rateLimiter } from '../services/rateLimiter.js';

/**
 * Action: Get Recent Transactions
 * Handles queries like: "what was the activity of 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum?"
 */
export const getRecentTxsAction: Action = {
  name: 'GET_RECENT_TXS',
  similes: ['WALLET_ACTIVITY', 'RECENT_TRANSACTIONS', 'WALLET_HISTORY'],
  description: 'Gets recent transactions for a wallet address with human-readable descriptions',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    const { addresses, chains } = extractBlockchainData(message.content.text);
    
    // Check if message contains wallet activity keywords and has valid address
    const hasActivityKeywords = ['activity', 'transactions', 'recent', 'history', 'wallet', 'happened'].some(
      keyword => text.includes(keyword)
    );
    
    return hasActivityKeywords && addresses.length > 0 && chains.length > 0;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ) => {
    logger.info('[GET_RECENT_TXS] Starting handler');
    try {
      const { addresses, chains } = extractBlockchainData(message.content.text);
      
      logger.info(`[GET_RECENT_TXS] Extracted data - addresses: ${JSON.stringify(addresses)}, chains: ${JSON.stringify(chains)}`);
      
      if (addresses.length === 0 || chains.length === 0) {
        logger.warn('[GET_RECENT_TXS] Missing addresses or chains');
        await callback({
          text: 'I need a valid wallet address and chain to check recent transactions. Please provide an address like 0x... and specify the chain (ethereum, polygon, etc.)',
          source: message.content.source,
        });
        return;
      }

      const address = addresses[0];
      const chain = chains[0];
      
      logger.info(`[GET_RECENT_TXS] Using address: ${address}, chain: ${chain}`);
      
      // Validate inputs
      const validAddress = addressSchema.safeParse(address);
      const validChain = chainSchema.safeParse(chain);
      
      logger.info(`[GET_RECENT_TXS] Validation results - address: ${validAddress.success}, chain: ${validChain.success}`);
      
      if (!validAddress.success || !validChain.success) {
        logger.warn(`[GET_RECENT_TXS] Validation failed - address: ${JSON.stringify(validAddress.error)}, chain: ${JSON.stringify(validChain.error)}`);
        await callback({
          text: `Invalid address or chain. Please provide a valid Ethereum address (0x...) and supported chain (ethereum, polygon, base, arbitrum, optimism, bsc).`,
          source: message.content.source,
        });
        return;
      }

      logger.info(`[GET_RECENT_TXS] Getting recent transactions for ${address} on ${chain}`);
      
      // Rate limiting
      logger.info('[GET_RECENT_TXS] Waiting for rate limiter...');
      await rateLimiter.waitForNextRequest();
      logger.info('[GET_RECENT_TXS] Rate limiter passed');
      
      // Initialize provider and fetch data
      logger.info('[GET_RECENT_TXS] Initializing IntentProvider...');
      const provider = new IntentProvider();
      logger.info('[GET_RECENT_TXS] Provider initialized, calling getRecentTxs...');
      const txs = await provider.getRecentTxs(validChain.data, validAddress.data);
      logger.info(`[GET_RECENT_TXS] API response received: ${txs?.length || 0} transactions`);
      
      if (!txs || txs.length === 0) {
        logger.warn('[GET_RECENT_TXS] No transactions found');
        await callback({
          text: `No recent transactions found for ${address} on ${chain}.`,
          actions: ['GET_RECENT_TXS'],
          source: message.content.source,
        });
        return;
      }

      logger.info('[GET_RECENT_TXS] Formatting response...');
      // Format the response
      const recentTxs = txs.slice(0, 5); // Show top 5 recent transactions
      let response = `🔍 **Recent activity for ${address} on ${chain}:**\n\n`;
      
      recentTxs.forEach((tx, index) => {
        const description = tx.classificationData?.description || 'Unknown transaction';
        const hash = tx.rawTransactionData?.transactionHash ? `${tx.rawTransactionData.transactionHash.slice(0, 10)}...` : 'N/A';
        const timestamp = tx.rawTransactionData?.timestamp ? new Date(tx.rawTransactionData.timestamp * 1000).toLocaleString() : 'N/A';
        
        response += `${index + 1}. **${description}**\n`;
        response += `   • Hash: ${hash}\n`;
        response += `   • Time: ${timestamp}\n\n`;
      });
      
      if (txs.length > 5) {
        response += `... and ${txs.length - 5} more transactions.`;
      }

      logger.info(`[GET_RECENT_TXS] Calling callback with response: ${response}`);
      await callback({
        text: response,
        actions: ['GET_RECENT_TXS'],
        source: message.content.source,
      });
      logger.info('[GET_RECENT_TXS] Callback completed successfully');

    } catch (error) {
      logger.error('[GET_RECENT_TXS] Error in action:', error);
      logger.error('[GET_RECENT_TXS] Error stack:', error.stack);
      logger.error('[GET_RECENT_TXS] Error message:', error.message);
      
      // Get addresses and chains for error message
      const { addresses: errorAddresses, chains: errorChains } = extractBlockchainData(message.content.text);
      
      // Provide a helpful fallback response instead of failing silently
      await callback({
        text: `Sorry, I encountered an error while fetching recent transactions for ${errorAddresses?.[0] || 'the address'} on ${errorChains?.[0] || 'the chain'}. This could be due to API rate limiting, network issues, or missing API credentials. Error: ${error.message}`,
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: 'User',
        content: {
          text: 'what was the activity of 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum?',
        },
      },
      {
        name: 'Assistant',
        content: {
          text: '🔍 **Recent activity for 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum:**\n\n1. **Swapped ETH for USDC**\n   • Hash: 0x1234567890...\n   • Time: 12/13/2025, 2:30:45 PM',
          actions: ['GET_RECENT_TXS'],
        },
      },
    ],
  ],
}; 