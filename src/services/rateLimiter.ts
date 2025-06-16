import { logger } from '@elizaos/core';

/**
 * Rate limiting utility to prevent API abuse
 * 2 second intervals, max 30 requests per minute
 */
export class RateLimiter {
  private requests: number[] = [];
  private lastRequest = 0;
  private readonly maxRequests = 30; // per minute
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly minInterval = 2000; // 2 seconds

  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);
    
    // Check if we've hit the rate limit
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      logger.warn(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForNextRequest();
    }
    
    // Ensure minimum interval between requests
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      logger.debug(`Waiting ${waitTime}ms for rate limit interval`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
    this.requests.push(this.lastRequest);
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(); 