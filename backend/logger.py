from datetime import datetime


def log(message, trace_id=None, level="INFO"):
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    trace = f" trace_id={trace_id}" if trace_id else ""
    print(f"[{now}] [{level}]{trace} {message}")