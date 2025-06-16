import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core';
import { logger } from '@elizaos/core';
import { IntentProvider } from '@noves/intent-ethers-provider';
import { addressSchema, chainSchema, type TokenPriceParams } from '../types.js';
import { extractBlockchainData } from '../services/utils.js';
import { rateLimiter } from '../services/rateLimiter.js';

/**
 * Action: Get Token Price
 * Handles queries like: "what is the price of the 0xae7ab96520de3a18e5e111b5eaab095312d7fe84 token on ethereum?"
 */
export const getTokenPriceAction: Action = {
  name: 'GET_TOKEN_PRICE',
  similes: ['TOKEN_PRICE', 'PRICE_CHECK', 'TOKEN_VALUE'],
  description: 'Gets current or historical price information for a token',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    const { addresses, chains } = extractBlockchainData(message.content.text);
    
    // Check if message is asking about token price
    const hasPriceKeywords = ['price', 'value', 'cost', 'worth', 'usd'].some(
      keyword => text.includes(keyword)
    );
    
    return hasPriceKeywords && addresses.length > 0 && chains.length > 0;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ) => {
    try {
      const { addresses, chains } = extractBlockchainData(message.content.text);
      const text = message.content.text.toLowerCase();
      
      if (addresses.length === 0 || chains.length === 0) {
        await callback({
          text: 'I need a valid token address and chain to check the price. Please provide a token address like 0x... and specify the chain.',
          source: message.content.source,
        });
        return;
      }

      const tokenAddress = addresses[0];
      const chain = chains[0];
      
      // Validate inputs
      const validAddress = addressSchema.safeParse(tokenAddress);
      const validChain = chainSchema.safeParse(chain);
      
      if (!validAddress.success || !validChain.success) {
        await callback({
          text: `Invalid token address or chain. Please provide a valid token address and supported chain.`,
          source: message.content.source,
        });
        return;
      }

      // Check if asking for historical price
      const isHistorical = text.includes('ago') || text.includes('was') || text.includes('month') || text.includes('week') || text.includes('day');
      let timestamp: string | undefined;
      
      if (isHistorical) {
        // Simple historical timestamp calculation (30 days ago as example)
        const thirtyDaysAgo = Math.floor((Date.now() - (30 * 24 * 60 * 60 * 1000)) / 1000);
        timestamp = thirtyDaysAgo.toString();
      }

      logger.info(`Getting ${isHistorical ? 'historical' : 'current'} price for ${tokenAddress} on ${chain}`);
      
      // Rate limiting
      await rateLimiter.waitForNextRequest();
      
      // Initialize provider and fetch data
      const provider = new IntentProvider();
      
      const priceParams: TokenPriceParams = {
        chain: validChain.data,
        token_address: validAddress.data,
        ...(timestamp && { timestamp }),
      };
      
      const priceData = await provider.getTokenPrice(priceParams);
      
      if (!priceData || !priceData.price) {
        await callback({
          text: `Price data not available for token ${tokenAddress} on ${chain}.`,
          actions: ['GET_TOKEN_PRICE'],
          source: message.content.source,
        });
        return;
      }

      // Format the response
      const price = parseFloat(priceData.price.amount);
      const currency = priceData.price.currency || 'USD';
      const symbol = priceData.token?.symbol || 'Unknown Token';
      const name = priceData.token?.name || tokenAddress;
      
      let response = `💰 **Token Price Information**\n\n`;
      response += `🏷️ **Token:** ${name} (${symbol})\n`;
      response += `📍 **Address:** ${tokenAddress}\n`;
      response += `⛓️ **Chain:** ${chain}\n`;
      response += `💵 **Price:** $${price.toLocaleString()} ${currency}\n`;
      
      if (timestamp) {
        const date = new Date(parseInt(timestamp) * 1000);
        response += `📅 **Date:** ${date.toLocaleDateString()} (Historical)\n`;
      } else {
        response += `⏰ **Updated:** Just now (Current)\n`;
      }
      
      if (priceData.pricedBy?.liquidity) {
        response += `💧 **Liquidity:** $${parseFloat(priceData.pricedBy.liquidity.toString()).toLocaleString()}\n`;
      }
      
      if (priceData.pricedBy?.exchange?.name) {
        response += `🏪 **Exchange:** ${priceData.pricedBy.exchange.name}\n`;
      }

      await callback({
        text: response,
        actions: ['GET_TOKEN_PRICE'],
        source: message.content.source,
      });

    } catch (error) {
      logger.error('Error in GET_TOKEN_PRICE action:', error);
      await callback({
        text: `Sorry, I encountered an error while fetching token price: ${error.message}`,
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: 'User',
        content: {
          text: 'what is the price of the 0xae7ab96520de3a18e5e111b5eaab095312d7fe84 token on ethereum?',
        },
      },
      {
        name: 'Assistant',
        content: {
          text: '💰 **Token Price Information**\n\n🏷️ **Token:** Lido Staked ETH (stETH)\n📍 **Address:** 0xae7ab96520de3a18e5e111b5eaab095312d7fe84\n⛓️ **Chain:** ethereum\n💵 **Price:** $3,245.67 USD',
          actions: ['GET_TOKEN_PRICE'],
        },
      },
    ],
  ],
}; 