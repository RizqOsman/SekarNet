from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import time
from functools import wraps

class CacheService:
    _cache: Dict[str, Dict[str, Any]] = {}
    
    def __init__(self):
        self.default_ttl = 3600  # 1 hour default TTL

    def cache(self, expire: int = 3600):
        """Simple in-memory cache decorator"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = await self.get_cache_key(*args, **kwargs)
                
                # Check if cached and not expired
                now = time.time()
                if cache_key in self._cache:
                    result, expire_time = self._cache[cache_key]
                    if expire_time > now:
                        return result
                    else:
                        del self._cache[cache_key]
                
                # Execute function and cache result
                result = await func(*args, **kwargs)
                self._cache[cache_key] = (result, now + expire)
                return result
            return wrapper
        return decorator

    @staticmethod
    async def get_cache_key(*args, **kwargs) -> str:
        """Generate a unique cache key based on arguments"""
        key_parts = [str(arg) for arg in args]
        key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
        return ":".join(key_parts)

    @classmethod
    async def invalidate_cache(cls, pattern: str = None):
        """Clear all cache or by pattern"""
        if pattern:
            cls._cache = {k: v for k, v in cls._cache.items() if not k.startswith(pattern)}
        else:
            cls._cache.clear()

def cached(
    expire: Optional[int] = None,
    namespace: Optional[str] = None,
    key_builder: Optional[callable] = None
):
    """Custom cache decorator with default settings"""
    cache_service = CacheService()
    return cache_service.cache(expire=expire or 3600)
