"""Запускает локальный сервер Flask и штатно останавливает его при простое."""

import logging
import threading

from werkzeug.serving import make_server

from app.factory import create_app


logger = logging.getLogger(__name__)


def run_server(host="127.0.0.1", port=5000, idle_timeout=10):
    app = create_app(idle_timeout=idle_timeout)
    server = make_server(host, port, app, threaded=True)
    activity = app.extensions["printnum"]["activity"]
    watcher = threading.Thread(
        target=activity.watch,
        args=(server.shutdown,),
        name="backend-idle-watchdog",
        daemon=True,
    )
    watcher.start()
    try:
        server.serve_forever()
    finally:
        activity.stop()
        server.server_close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_server()
