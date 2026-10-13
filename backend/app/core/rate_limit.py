import math
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request


class RateLimiter:
    def __init__(
        self,
        max_requests: int,
        window_seconds: int,
        message: str = "Too many requests."
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.message = message
        self.requests = defaultdict(deque)

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        request_times = self.requests[client_ip]

        while (
            request_times
            and request_times[0] <= now - self.window_seconds
        ):
            request_times.popleft()

        if len(request_times) >= self.max_requests:
            retry_after = max(
                math.ceil(
                    self.window_seconds
                    - (now - request_times[0])
                ),
                1
            )

            raise HTTPException(
                status_code=429,
                detail=(
                    f"{self.message} "
                    f"Try again in {retry_after} seconds."
                ),
                headers={
                    "Retry-After": str(retry_after)
                }
            )

        request_times.append(now)