import logging


def setup_logging(service_name: str):
    logging.basicConfig(
        level=logging.INFO,
        format=f"%(asctime)s | {service_name} | %(levelname)s | %(message)s",
    )

    return logging.getLogger(service_name)