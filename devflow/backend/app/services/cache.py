"""
Cache Service

This service handles caching of frequently accessed explanations and code chunks using Redis.
"""

import redis
import json
from typing import Optional, Dict, Any
import hashlib
from datetime import timedelta

class CacheService:
    def __init__(self, host: str = 'localhost', port: int = 6379, db: int = 0):
        """Initialize the cache service with Redis connection."""
        self.redis = redis.Redis(host=host, port=port, db=db, decode_responses=True)
        self.default_ttl = timedelta(hours=24)  # Default cache expiration time
        
    def _generate_key(self, prefix: str, identifier: str) -> str:
        """Generate a unique cache key."""
        # Create a hash of the identifier to ensure valid Redis key
        hash_obj = hashlib.md5(identifier.encode())
        return f"{prefix}:{hash_obj.hexdigest()}"
    
    def get(self, prefix: str, identifier: str) -> Optional[Dict]:
        """Retrieve a value from cache."""
        key = self._generate_key(prefix, identifier)
        data = self.redis.get(key)
        if data:
            return json.loads(data)
        return None
    
    def set(self, prefix: str, identifier: str, value: Dict, ttl: Optional[timedelta] = None) -> bool:
        """Store a value in cache with optional TTL."""
        key = self._generate_key(prefix, identifier)
        try:
            self.redis.setex(
                key,
                ttl or self.default_ttl,
                json.dumps(value)
            )
            return True
        except Exception as e:
            print(f"Cache set error: {str(e)}")
            return False
    
    def delete(self, prefix: str, identifier: str) -> bool:
        """Remove a value from cache."""
        key = self._generate_key(prefix, identifier)
        try:
            self.redis.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {str(e)}")
            return False
    
    def clear(self, prefix: Optional[str] = None) -> bool:
        """Clear all cache entries or those with a specific prefix."""
        try:
            if prefix:
                # Delete all keys matching the prefix
                pattern = f"{prefix}:*"
                keys = self.redis.keys(pattern)
                if keys:
                    self.redis.delete(*keys)
            else:
                # Clear all keys
                self.redis.flushdb()
            return True
        except Exception as e:
            print(f"Cache clear error: {str(e)}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        try:
            return {
                'total_keys': self.redis.dbsize(),
                'memory_used': self.redis.info()['used_memory_human'],
                'connected_clients': self.redis.info()['connected_clients']
            }
        except Exception as e:
            print(f"Cache stats error: {str(e)}")
            return {
                'total_keys': 0,
                'memory_used': '0B',
                'connected_clients': 0
            } 