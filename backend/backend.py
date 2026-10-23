"""Запускает локальный сервер Flask и штатно останавливает его при простое."""

import argparse
import logging
import threading

from werkzeug.serving import make_server

from app.factory import create_app


logger = logging.getLogger(__name__)


def run_server(host="127.0.0.1", port=5000, idle_timeout=10, standalone=False):
    app = create_app(idle_timeout=idle_timeout, standalone=standalone)
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


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--standalone",
        action="store_true",
        help="Отключить тайм-аут простоя и проверять статус принтера перед каждой печатью",
    )
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO)
    run_server(standalone=args.standalone)


if __name__ == "__main__":
    main()
