import time
import random
import uuid
from functools import wraps

def retry_with_backoff(
	max_attempts=3,
	initial_delay=1.0,
	backoff_factor=2.0,
	jitter=0.2,
	exceptions=(Exception,)
):
	"""
	Decorator for retrying a function with exponential backoff and jitter.
	"""
	def decorator(func):
		@wraps(func)
		def wrapper(*args, **kwargs):
			delay = initial_delay
			for attempt in range(1, max_attempts + 1):
				try:
					return func(*args, **kwargs)
				except exceptions as e:
					if attempt == max_attempts:
						raise
					sleep_time = delay * (1 + random.uniform(-jitter, jitter))
					time.sleep(sleep_time)
					delay *= backoff_factor
		return wrapper
	return decorator

def generate_trace_id():
	"""Generate a unique trace ID for logging and tracing pipeline runs."""
	return str(uuid.uuid4())
