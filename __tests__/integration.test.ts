import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { novesPlugin } from '../src/index';
import { logger } from '@elizaos/core';

/**
 * Integration tests for the Noves blockchain plugin
 * These tests verify that the plugin actions work correctly together
 */

// Set up spies on logger
beforeAll(() => {
  vi.spyOn(logger, 'info');
  vi.spyOn(logger, 'error');
  vi.spyOn(logger, 'warn');
  vi.spyOn(logger, 'debug');
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Integration: Plugin Actions Work Together', () => {
  it('should have all three blockchain actions available', () => {
    const actions = novesPlugin.actions || [];
    const actionNames = actions.map(action => action.name);
    
    expect(actionNames).toContain('GET_RECENT_TXS');
    expect(actionNames).toContain('GET_TRANSLATED_TX');
    expect(actionNames).toContain('GET_TOKEN_PRICE');
    expect(actions).toHaveLength(3);
  });

  it('should correctly identify different types of blockchain queries', async () => {
    const actions = novesPlugin.actions || [];
    
    // Test wallet activity query
    const walletQuery = {
      content: {
        text: 'show me recent activity for 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum',
      },
    } as any;
    
    const recentTxsAction = actions.find(action => action.name === 'GET_RECENT_TXS');
    const isWalletValid = await recentTxsAction?.validate({} as any, walletQuery, {} as any);
    expect(isWalletValid).toBe(true);
    
    // Test transaction analysis query
    const txQuery = {
      content: {
        text: 'explain this transaction 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6 on ethereum',
      },
    } as any;
    
    const translatedTxAction = actions.find(action => action.name === 'GET_TRANSLATED_TX');
    const isTxValid = await translatedTxAction?.validate({} as any, txQuery, {} as any);
    expect(isTxValid).toBe(true);
    
    // Test token price query
    const priceQuery = {
      content: {
        text: 'what is the current price of 0xae7ab96520de3a18e5e111b5eaab095312d7fe84 on ethereum?',
      },
    } as any;
    
    const tokenPriceAction = actions.find(action => action.name === 'GET_TOKEN_PRICE');
    const isPriceValid = await tokenPriceAction?.validate({} as any, priceQuery, {} as any);
    expect(isPriceValid).toBe(true);
  });

  it('should properly validate different blockchain networks', async () => {
    const actions = novesPlugin.actions || [];
    const recentTxsAction = actions.find(action => action.name === 'GET_RECENT_TXS');
    
    // Test different supported chains
    const supportedChains = ['ethereum', 'polygon', 'base', 'arbitrum', 'optimism', 'bsc'];
    
    for (const chain of supportedChains) {
      const query = {
        content: {
          text: `show activity for 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ${chain}`,
        },
      } as any;
      
      const isValid = await recentTxsAction?.validate({} as any, query, {} as any);
      expect(isValid).toBe(true);
    }
  });

  it('should handle edge cases gracefully', async () => {
    const actions = novesPlugin.actions || [];
    
    // Test queries without valid addresses
    const invalidQueries = [
      'show me recent activity',
      'what happened yesterday',
      'tell me about blockchain',
      'price of bitcoin',
    ];
    
    for (const queryText of invalidQueries) {
      const query = {
        content: { text: queryText },
      } as any;
      
      // None of the actions should validate these queries
      for (const action of actions) {
        const isValid = await action.validate({} as any, query, {} as any);
        expect(isValid).toBe(false);
      }
    }
  });
});

describe('Integration: Plugin Initialization', () => {
  it('should initialize the plugin successfully', async () => {
    if (novesPlugin.init) {
      // Should initialize without any config since no API key is needed
      await novesPlugin.init();
      
      // Check that logger was called with initialization messages
      expect(logger.info).toHaveBeenCalledWith('🚀 Noves blockchain plugin initialized successfully!');
      expect(logger.info).toHaveBeenCalledWith('✅ Available actions: GET_RECENT_TXS, GET_TRANSLATED_TX, GET_TOKEN_PRICE');
      expect(logger.info).toHaveBeenCalledWith('⚡ Rate limiting: 30 requests/minute, 2-second intervals');
    }
  });

  it('should have correct plugin structure', () => {
    // Verify plugin has the right structure for ElizaOS
    expect(novesPlugin.name).toBeDefined();
    expect(novesPlugin.description).toBeDefined();
    expect(novesPlugin.actions).toBeDefined();
    expect(novesPlugin.providers).toBeDefined();
    expect(novesPlugin.services).toBeDefined();
    
    // Verify it's focused on blockchain functionality
    expect(novesPlugin.providers).toEqual([]);
    expect(novesPlugin.services).toEqual([]);
    expect(novesPlugin.actions).toHaveLength(3);
  });
});
