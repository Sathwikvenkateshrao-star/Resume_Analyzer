import logging
## using the log file not just the print for debugging ease
def get_logger(name:str):
    logger = logging.getLogger(name)
    if not logger.handlers: ## this prevents the duplicate logs
        handler = logging.FileHandler("resume_analyzer.log")
        formatter = logging.Formatter(
            "%(asctime)s -%(name)s -%(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

## this next used in the app.py