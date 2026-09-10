export class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private lastRefillTime: number;

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.tokens = maxTokens;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timeElapsedSec = (now - this.lastRefillTime) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + timeElapsedSec * this.refillRate);
    this.lastRefillTime = now;
  }

  public async acquire(): Promise<void> {
    return new Promise((resolve) => {
      const attempt = () => {
        this.refill();
        if (this.tokens >= 1) {
          this.tokens -= 1;
          resolve();
        } else {
          const timeToNextTokenMs = ((1 - this.tokens) / this.refillRate) * 1000;
          setTimeout(attempt, timeToNextTokenMs);
        }
      };
      attempt();
    });
  }
}
