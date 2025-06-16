import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { novesPlugin } from '../src/index';
import { logger } from '@elizaos/core';
import dotenv from 'dotenv';

// Setup environment variables
dotenv.config();

// Need to spy on logger for documentation
beforeAll(() => {
  vi.spyOn(logger, 'info');
  vi.spyOn(logger, 'error');
  vi.spyOn(logger, 'warn');
  vi.spyOn(logger, 'debug');
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Noves Plugin Configuration', () => {
  it('should have correct plugin metadata', () => {
    expect(novesPlugin.name).toBe('plugin-noves');
    expect(novesPlugin.description).toBe('ElizaOS plugin for blockchain data using Noves Intents');
    expect(novesPlugin.actions).toBeDefined();
    expect(novesPlugin.actions).toHaveLength(3);
  });

  it('should have the three blockchain actions', () => {
    const actionNames = novesPlugin.actions?.map(action => action.name) || [];
    expect(actionNames).toContain('GET_RECENT_TXS');
    expect(actionNames).toContain('GET_TRANSLATED_TX');
    expect(actionNames).toContain('GET_TOKEN_PRICE');
  });

  it('should initialize properly', async () => {
    if (novesPlugin.init) {
      // Initialize without any config since no API key is needed
      await novesPlugin.init();
      expect(true).toBe(true); // If we got here, init succeeded
    }
  });

  it('should have empty providers and services arrays', () => {
    expect(novesPlugin.providers).toEqual([]);
    expect(novesPlugin.services).toEqual([]);
  });
});

describe('GET_RECENT_TXS Action', () => {
  const getRecentTxsAction = novesPlugin.actions?.find(action => action.name === 'GET_RECENT_TXS');
  
  it('should be defined and have correct metadata', () => {
    expect(getRecentTxsAction).toBeDefined();
    expect(getRecentTxsAction?.description).toBe('Gets recent transactions for a wallet address with human-readable descriptions');
    expect(getRecentTxsAction?.similes).toContain('WALLET_ACTIVITY');
  });

  it('should validate messages with wallet addresses and chains', async () => {
    if (getRecentTxsAction?.validate) {
      const validMessage = {
        content: {
          text: 'what was the activity of 0x625758C705bf970375fF780f3544C1ddc8eeb6Ab on ethereum?',
        },
      } as any;

      const isValid = await getRecentTxsAction.validate({} as any, validMessage, {} as any);
      expect(isValid).toBe(true);
    }
  });

  it('should not validate messages without addresses or chains', async () => {
    if (getRecentTxsAction?.validate) {
      const invalidMessage = {
        content: {
          text: 'hello world',
        },
      } as any;

      const isValid = await getRecentTxsAction.validate({} as any, invalidMessage, {} as any);
      expect(isValid).toBe(false);
    }
  });
});

describe('GET_TRANSLATED_TX Action', () => {
  const getTranslatedTxAction = novesPlugin.actions?.find(action => action.name === 'GET_TRANSLATED_TX');
  
  it('should be defined and have correct metadata', () => {
    expect(getTranslatedTxAction).toBeDefined();
    expect(getTranslatedTxAction?.description).toBe('Gets detailed human-readable information about a specific transaction');
    expect(getTranslatedTxAction?.similes).toContain('EXPLAIN_TRANSACTION');
  });

  it('should validate messages with transaction hashes and chains', async () => {
    if (getTranslatedTxAction?.validate) {
      const validMessage = {
        content: {
          text: 'what happened in 0x700d06dc473f95530a0dfa04c1fe679aecd722d2a14e07170704fb7a8d2381f6 on ethereum?',
        },
      } as any;

      const isValid = await getTranslatedTxAction.validate({} as any, validMessage, {} as any);
      expect(isValid).toBe(true);
    }
  });

  it('should not validate messages without transaction hashes', async () => {
    if (getTranslatedTxAction?.validate) {
      const invalidMessage = {
        content: {
          text: 'what happened today?',
        },
      } as any;

      const isValid = await getTranslatedTxAction.validate({} as any, invalidMessage, {} as any);
      expect(isValid).toBe(false);
    }
  });
});

describe('GET_TOKEN_PRICE Action', () => {
  const getTokenPriceAction = novesPlugin.actions?.find(action => action.name === 'GET_TOKEN_PRICE');
  
  it('should be defined and have correct metadata', () => {
    expect(getTokenPriceAction).toBeDefined();
    expect(getTokenPriceAction?.description).toBe('Gets current or historical price information for a token');
    expect(getTokenPriceAction?.similes).toContain('TOKEN_PRICE');
  });

  it('should validate messages with token addresses and price keywords', async () => {
    if (getTokenPriceAction?.validate) {
      const validMessage = {
        content: {
          text: 'what is the price of 0xae7ab96520de3a18e5e111b5eaab095312d7fe84 on ethereum?',
        },
      } as any;

      const isValid = await getTokenPriceAction.validate({} as any, validMessage, {} as any);
      expect(isValid).toBe(true);
    }
  });

  it('should not validate messages without price keywords', async () => {
    if (getTokenPriceAction?.validate) {
      const invalidMessage = {
        content: {
          text: 'tell me about 0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        },
      } as any;

      const isValid = await getTokenPriceAction.validate({} as any, invalidMessage, {} as any);
      expect(isValid).toBe(false);
    }
  });
});
