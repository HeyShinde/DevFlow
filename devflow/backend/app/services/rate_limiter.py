"""
Rate Limiter Service

This service handles rate limiting for API endpoints using Redis.
"""

import time
from typing import Optional
import redis
from fastapi import HTTPException, Request
from ..core.config import get_settings

settings = get_settings()

class RateLimiter:
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        """Initialize the rate limiter with Redis connection."""
        self.redis = redis.from_url(redis_url, decode_responses=True)
        
    async def check_rate_limit(
        self,
        request: Request,
        key_prefix: str,
        max_requests: int = 60,
        window_seconds: int = 60
    ) -> bool:
        """
        Check if a request should be rate limited.
        
        Args:
            request: FastAPI request object
            key_prefix: Prefix for the Redis key
            max_requests: Maximum number of requests allowed in the window
            window_seconds: Time window in seconds
            
        Returns:
            bool: True if request is allowed, False if rate limited
        """
        # Get client IP or use a default key if IP is not available
        client_ip = request.client.host if request.client else "unknown"
        key = f"{key_prefix}:{client_ip}"
        
        # Get current timestamp
        now = int(time.time())
        
        # Use Redis pipeline for atomic operations
        pipe = self.redis.pipeline()
        
        # Add current timestamp to the sorted set
        pipe.zadd(key, {str(now): now})
        
        # Remove timestamps outside the window
        pipe.zremrangebyscore(key, 0, now - window_seconds)
        
        # Count requests in the window
        pipe.zcard(key)
        
        # Set expiry on the key
        pipe.expire(key, window_seconds)
        
        # Execute pipeline
        _, _, request_count, _ = pipe.execute()
        
        # Check if rate limit is exceeded
        if request_count > max_requests:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "retry_after": window_seconds,
                    "limit": max_requests,
                    "window": window_seconds
                }
            )
        
        return True

# Create a global rate limiter instance
rate_limiter = RateLimiter() 