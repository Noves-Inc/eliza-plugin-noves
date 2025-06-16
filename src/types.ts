import { z } from 'zod';

/**
 * Validation schemas for inputs
 */
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');
export const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash');
export const chainSchema = z.enum(['ethereum', 'polygon', 'base', 'arbitrum', 'optimism', 'bsc']);

/**
 * Supported blockchain chains
 */
export type SupportedChain = z.infer<typeof chainSchema>;

/**
 * Extracted blockchain data from text
 */
export interface BlockchainData {
  addresses: string[];
  txHashes: string[];
  chains: string[];
}

/**
 * Token price request parameters
 */
export interface TokenPriceParams {
  chain: SupportedChain;
  token_address: string;
  timestamp?: string;
} 