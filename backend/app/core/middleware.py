from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional, Dict
import time
from collections import defaultdict
from datetime import datetime

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        admin_requests_per_minute: int = 300
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.admin_requests_per_minute = admin_requests_per_minute
        self.window = 60  # 1 minute window
        self.request_history = defaultdict(list)  # Store request timestamps by client IP

    async def dispatch(
        self, request: Request, call_next
    ):
        # Skip rate limiting for static files and docs
        if request.url.path.startswith(("/static/", "/docs/", "/redoc/")):
            return await call_next(request)

        # Get client IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client = forwarded.split(",")[0]
        else:
            client = request.client.host

        # Get user role from request state if authenticated
        is_admin = getattr(request.state, "is_admin", False)
        
        # Calculate rate limit based on role
        rate_limit = self.admin_requests_per_minute if is_admin else self.requests_per_minute
        
        # Get current timestamp
        now = int(time.time())
        
        # Clean up old requests
        self.request_history[client] = [
            ts for ts in self.request_history[client] 
            if now - ts < self.window
        ]
        
        # Add current request
        self.request_history[client].append(now)
        
        # Count requests in current window
        request_count = len(self.request_history[client])
        
        # Check if rate limit is exceeded
        if request_count > rate_limit:
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Too many requests",
                    "retry_after": self.window
                }
            )

        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(rate_limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, rate_limit - request_count))
        response.headers["X-RateLimit-Reset"] = str(now + self.window)
        
        return response
