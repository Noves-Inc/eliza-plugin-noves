import type { BlockchainData } from '../types.js';

/**
 * Utility to extract addresses, tx hashes, and chains from text
 */
export function extractBlockchainData(text: string): BlockchainData {
  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  const txHashRegex = /0x[a-fA-F0-9]{64}/g;
  const chainRegex = /\b(ethereum|polygon|base|arbitrum|optimism|bsc|eth|matic)\b/gi;
  
  const addresses = [...text.matchAll(addressRegex)].map(match => match[0]);
  const txHashes = [...text.matchAll(txHashRegex)].map(match => match[0]);
  const chains = [...text.matchAll(chainRegex)].map(match => {
    const chain = match[0].toLowerCase();
    return chain === 'eth' ? 'ethereum' : chain === 'matic' ? 'polygon' : chain;
  });
  
  return { addresses, txHashes, chains };
} 