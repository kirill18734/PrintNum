"""Совместимая функция загрузки настроек через репозиторий приложения."""

from app.infrastructure.config_repository import ConfigRepository

_repository = ConfigRepository()


def load_config():
    return _repository.load()
