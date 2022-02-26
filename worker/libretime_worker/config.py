from os import getenv

from kombu import Exchange, Queue
from libretime_shared.config import BaseConfig, RabbitMQConfig


class Config(BaseConfig):
    rabbitmq: RabbitMQConfig = RabbitMQConfig()


LIBRETIME_CONFIG_FILEPATH = getenv("LIBRETIME_CONFIG_FILEPATH")

config = Config(filepath=LIBRETIME_CONFIG_FILEPATH)

# Celery amqp settings
BROKER_URL = config.rabbitmq.url
CELERY_RESULT_BACKEND = "amqp"  # Use RabbitMQ as the celery backend
CELERY_RESULT_PERSISTENT = True  # Persist through a broker restart
CELERY_TASK_RESULT_EXPIRES = 900  # Expire task results after 15 minutes
CELERY_RESULT_EXCHANGE = "celeryresults"  # Default exchange - needed due to php-celery
CELERY_QUEUES = (
    Queue("podcast", exchange=Exchange("podcast"), routing_key="podcast"),
    Queue(exchange=Exchange("celeryresults"), auto_delete=True),
)
CELERY_EVENT_QUEUE_EXPIRES = 900  # RabbitMQ x-expire after 15 minutes

# Celery task settings
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TIMEZONE = "Europe/Berlin"
CELERY_ENABLE_UTC = True
