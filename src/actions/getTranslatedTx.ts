import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core';
import { logger } from '@elizaos/core';
import { IntentProvider } from '@noves/intent-ethers-provider';
import { txHashSchema, chainSchema } from '../types.js';
import { extractBlockchainData } from '../services/utils.js';
import { rateLimiter } from '../services/rateLimiter.js';

/**
 * Action: Get Translated Transaction
 * Handles queries like: "what happened in 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6 on ethereum?"
 */
export const getTranslatedTxAction: Action = {
  name: 'GET_TRANSLATED_TX',
  similes: ['EXPLAIN_TRANSACTION', 'TRANSACTION_DETAILS', 'WHAT_HAPPENED'],
  description: 'Gets detailed human-readable information about a specific transaction',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    const { txHashes, chains } = extractBlockchainData(message.content.text);
    
    // Check if message is asking about a specific transaction
    const hasTransactionKeywords = ['transaction', 'happened', 'understand', 'explain', 'details'].some(
      keyword => text.includes(keyword)
    );
    
    return hasTransactionKeywords && txHashes.length > 0 && chains.length > 0;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ) => {
    logger.info('[GET_TRANSLATED_TX] Starting handler');
    try {
      const { txHashes, chains } = extractBlockchainData(message.content.text);
      
      logger.info(`[GET_TRANSLATED_TX] Extracted data - txHashes: ${JSON.stringify(txHashes)}, chains: ${JSON.stringify(chains)}`);
      
      if (txHashes.length === 0 || chains.length === 0) {
        logger.warn('[GET_TRANSLATED_TX] Missing transaction hash or chains');
        await callback({
          text: 'I need a valid transaction hash and chain to explain the transaction. Please provide a transaction hash like 0x... and specify the chain.',
          source: message.content.source,
        });
        return;
      }

      const txHash = txHashes[0];
      const chain = chains[0];
      
      logger.info(`[GET_TRANSLATED_TX] Using txHash: ${txHash}, chain: ${chain}`);
      
      // Validate inputs
      const validTxHash = txHashSchema.safeParse(txHash);
      const validChain = chainSchema.safeParse(chain);
      
      logger.info(`[GET_TRANSLATED_TX] Validation results - txHash: ${validTxHash.success}, chain: ${validChain.success}`);
      
      if (!validTxHash.success || !validChain.success) {
        logger.warn(`[GET_TRANSLATED_TX] Validation failed - txHash: ${JSON.stringify(validTxHash.error)}, chain: ${JSON.stringify(validChain.error)}`);
        await callback({
          text: `Invalid transaction hash or chain. Please provide a valid transaction hash (0x...) and supported chain.`,
          source: message.content.source,
        });
        return;
      }

      logger.info(`[GET_TRANSLATED_TX] Getting transaction details for ${txHash} on ${chain}`);
      
      // Rate limiting
      logger.info('[GET_TRANSLATED_TX] Waiting for rate limiter...');
      await rateLimiter.waitForNextRequest();
      logger.info('[GET_TRANSLATED_TX] Rate limiter passed');
      
      // Initialize provider and fetch data
      logger.info('[GET_TRANSLATED_TX] Initializing IntentProvider...');
      const provider = new IntentProvider();
      logger.info('[GET_TRANSLATED_TX] Provider initialized, calling getTranslatedTx...');
      const tx = await provider.getTranslatedTx(validChain.data, validTxHash.data);
      logger.info(`[GET_TRANSLATED_TX] API response received: ${JSON.stringify(tx, null, 2)}`);
      
      if (!tx) {
        logger.warn('[GET_TRANSLATED_TX] Transaction not found');
        await callback({
          text: `Transaction ${txHash} not found on ${chain}.`,
          actions: ['GET_TRANSLATED_TX'],
          source: message.content.source,
        });
        return;
      }

      logger.info('[GET_TRANSLATED_TX] Formatting response...');
      // Format the response
      const description = tx.classificationData?.description || 'Unknown transaction';
      const timestamp = tx.rawTransactionData?.timestamp ? new Date(tx.rawTransactionData.timestamp * 1000).toLocaleString() : 'N/A';
      
      let response = `🔍 **Transaction Analysis for ${txHash}**\n\n`;
      response += `📋 **Description:** ${description}\n`;
      response += `⏰ **Time:** ${timestamp}\n`;
      response += `⛓️ **Chain:** ${chain}\n`;
      
      if (tx.rawTransactionData?.gasUsed && tx.rawTransactionData?.gasPrice) {
        const gasCost = (parseFloat(tx.rawTransactionData.gasUsed.toString()) * parseFloat(tx.rawTransactionData.gasPrice.toString())) / 1e18;
        response += `⛽ **Gas Cost:** ${gasCost.toFixed(6)} ETH\n`;
      }
      
      if (tx.classificationData?.type) {
        response += `🏷️ **Type:** ${tx.classificationData.type}\n`;
      }

      logger.info(`[GET_TRANSLATED_TX] Calling callback with response: ${response}`);
      await callback({
        text: response,
        actions: ['GET_TRANSLATED_TX'],
        source: message.content.source,
      });
      logger.info('[GET_TRANSLATED_TX] Callback completed successfully');

    } catch (error) {
      logger.error('[GET_TRANSLATED_TX] Error in action:', error);
      logger.error('[GET_TRANSLATED_TX] Error stack:', error.stack);
      logger.error('[GET_TRANSLATED_TX] Error message:', error.message);
      await callback({
        text: `Sorry, I encountered an error while analyzing the transaction: ${error.message}`,
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: 'User',
        content: {
          text: 'what happened in 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6 on ethereum?',
        },
      },
      {
        name: 'Assistant',
        content: {
          text: '🔍 **Transaction Analysis for 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6**\n\n📋 **Description:** Swapped 1.5 ETH for 3,240 USDC\n⏰ **Time:** 12/13/2025, 2:30:45 PM\n📊 **Status:** ✅ Success',
          actions: ['GET_TRANSLATED_TX'],
        },
      },
    ],
  ],
}; 