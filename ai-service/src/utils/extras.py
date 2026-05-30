import functools
import time

def async_timer(func):
    """
    Decorator to measure execution time of async functions
    """
    
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"⏱️  {func.__name__} took {elapsed_time:.4f} seconds")
        return result
    return wrapper