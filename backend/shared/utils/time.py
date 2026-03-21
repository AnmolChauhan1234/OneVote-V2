from datetime import datetime


def utc_now():
    return datetime.utcnow()


def iso_now():
    return datetime.utcnow().isoformat()