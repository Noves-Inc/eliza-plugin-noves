import type { Plugin } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { getRecentTxsAction, getTranslatedTxAction, getTokenPriceAction } from './actions/index.js';

export const novesPlugin: Plugin = {
  name: 'plugin-noves',
  description: 'ElizaOS plugin for blockchain data using Noves Intents',
  
  actions: [getRecentTxsAction, getTranslatedTxAction, getTokenPriceAction],
  
  // No providers, services, models, routes, or events needed for this plugin
  providers: [],
  services: [],
  
  // Simple initialization
  async init() {
    logger.info('🚀 Noves blockchain plugin initialized successfully!');
    logger.info('✅ Available actions: GET_RECENT_TXS, GET_TRANSLATED_TX, GET_TOKEN_PRICE');
    logger.info('⚡ Rate limiting: 30 requests/minute, 2-second intervals');
  },
};

export default novesPlugin;

// Re-export types for external usage
export type * from './types.js';

// Re-export actions for external usage
export { getRecentTxsAction, getTranslatedTxAction, getTokenPriceAction } from './actions/index.js';

// Re-export services for external usage (if needed)
export { RateLimiter, rateLimiter, extractBlockchainData } from './services/index.js';
