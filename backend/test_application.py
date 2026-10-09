"""Интеграционные тесты маршрутов, служб печати и остановки бэкенда."""

import base64
import json
import sys
import tempfile
import threading
import time
import types
import unittest
from unittest.mock import patch
from urllib.request import Request, urlopen
from pathlib import Path

from werkzeug.serving import make_server

from app.factory import create_app
from app.infrastructure.config_repository import ConfigRepository
from app.infrastructure.runtime_activity import RuntimeActivity
from app.infrastructure.windows_printer import WindowsPrinterAdapter


class FakePrinter:
    def __init__(self, online=True):
        self.online = online
        self.printed_numbers = []
        self.printed_labels = []
        self.cleared_queues = []
        self.operations = []
        self.fail_print = False
        self.fail_clear = False

    def list_printers(self):
        return ["Test printer"]

    def is_online(self, printer_name):
        return self.online and printer_name == "Test printer"

    def clear_queue(self, printer_name):
        if self.fail_clear:
            raise RuntimeError("queue clear error")
        self.cleared_queues.append(printer_name)
        self.operations.append(("clear", printer_name))

    def print_number(self, text, config):
        if self.fail_print:
            raise RuntimeError("printer error")
        self.printed_numbers.append((text, config.copy()))
        self.operations.append(("print-number", config["printer"]))

    def print_label(self, **label):
        if self.fail_print:
            raise RuntimeError("printer error")
        self.printed_labels.append(label)
        self.operations.append(("print-label", label["config"]["printer"]))


class BackendApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        config_path = Path(self.temp_dir.name) / "config.json"
        config_path.write_text(
            '{"printer":"Test printer","running":true,"excludedTexts":["skip"]}',
            encoding="utf-8",
        )
        self.printer = FakePrinter()
        self.app = create_app(
            config_repository=ConfigRepository(config_path),
            printer_adapter=self.printer,
            enable_cors=False,
        )
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_health_and_printer_endpoints(self):
        self.assertEqual(self.client.get("/").json, {"status": True})
        self.assertEqual(
            self.client.get("/listPrinters").json,
            {"listPrinters": ["Test printer"]},
        )
        self.assertEqual(
            self.client.get("/status-printer").json,
            {"printerOnline": True},
        )

    def test_auto_print_skips_excluded_text_silently_and_prints_other_text(self):
        skipped = self.client.post("/print-number", json={"text": "Skip this"})
        self.assertEqual(skipped.status_code, 200)
        self.assertEqual(skipped.json["status"], "skipped")
        self.assertEqual(skipped.json["rule"], "skip")
        self.assertEqual(self.printer.printed_numbers, [])
        event = self.client.get("/auto-print-status").json["event"]
        self.assertEqual(event["text"], "Skip this")
        self.assertEqual(event["status"], "skipped")
        self.assertEqual(
            [step["message"] for step in event["steps"]],
            [
                "Текст получен",
                "Найдено исключение «skip»",
                "Не напечатан: текст соответствует исключению",
            ],
        )

        printed = self.client.post("/print-number", json={"text": "Order 123"})
        self.assertEqual(printed.data, b"OK")
        self.assertEqual(self.printer.printed_numbers[0][0], "Order 123")
        self.assertEqual(self.printer.cleared_queues, ["Test printer"])
        event = self.client.get("/auto-print-status").json["event"]
        self.assertEqual(event["text"], "Order 123")
        self.assertEqual(event["status"], "printed")
        self.assertEqual(event["steps"][-1]["message"], "Отправлен на печать")

    def test_auto_print_status_is_empty_until_text_is_received(self):
        self.assertEqual(
            self.client.get("/auto-print-status").json,
            {"event": None},
        )

    def test_queue_is_cleared_before_each_print_job(self):
        self.client.post("/print-number", json={"text": "Order 1"})
        self.client.post(
            "/print-label",
            json={"contentType": "text", "content": "Label 1"},
        )

        self.assertEqual(
            self.printer.cleared_queues,
            ["Test printer", "Test printer"],
        )
        self.assertEqual(
            self.printer.operations,
            [
                ("clear", "Test printer"),
                ("print-number", "Test printer"),
                ("clear", "Test printer"),
                ("print-label", "Test printer"),
            ],
        )

    def test_print_is_not_submitted_when_queue_cannot_be_cleared(self):
        self.printer.fail_clear = True

        label_response = self.client.post(
            "/print-label",
            json={"contentType": "text", "content": "Label 1"},
        )
        number_response = self.client.post(
            "/print-number",
            json={"text": "Order 1"},
        )

        self.assertEqual(label_response.status_code, 500)
        self.assertEqual(number_response.status_code, 500)
        event = self.client.get("/auto-print-status").json["event"]
        self.assertEqual(event["text"], "Order 1")
        self.assertEqual(event["status"], "error")
        self.assertEqual(event["steps"][-1]["status"], "error")
        self.assertEqual(self.printer.printed_labels, [])
        self.assertEqual(self.printer.printed_numbers, [])

    def test_manual_label_route_uses_printer_service(self):
        response = self.client.post(
            "/print-label",
            json={"contentType": "text", "content": "Label 1"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"status": "printed"})
        self.assertEqual(self.printer.printed_labels[0]["content"], "Label 1")
        self.assertEqual(self.printer.cleared_queues, ["Test printer"])

    def test_invalid_request_and_printer_states_have_http_errors(self):
        invalid = self.client.post("/print-number", json={"text": 42})
        self.assertEqual(invalid.status_code, 400)

        self.printer.online = False
        unavailable = self.client.post(
            "/print-label",
            json={"contentType": "text", "content": "Label 1"},
        )
        self.assertEqual(unavailable.status_code, 503)
        self.assertEqual(self.printer.printed_labels, [])

    def test_code_image_request_is_decoded_before_printer_adapter(self):
        png_data = b"\x89PNG\r\n\x1a\nimage data"
        response = self.client.post(
            "/print-label",
            json={
                "contentType": "qr",
                "content": "https://example.com",
                "codeImage": base64.b64encode(png_data).decode("ascii"),
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.printer.printed_labels[0]["code_image"], png_data)

    def test_printer_errors_are_returned_as_server_errors(self):
        self.printer.fail_print = True
        label_response = self.client.post(
            "/print-label",
            json={"contentType": "text", "content": "Label 1"},
        )
        number_response = self.client.post(
            "/print-number",
            json={"text": "Order 1"},
        )
        self.assertEqual(label_response.status_code, 500)
        self.assertEqual(number_response.status_code, 500)


class RuntimeActivityTests(unittest.TestCase):
    def test_idle_watch_requests_graceful_shutdown(self):
        activity = RuntimeActivity(idle_timeout=0.01)
        shutdown_requested = threading.Event()
        watcher = threading.Thread(
            target=activity.watch,
            args=(shutdown_requested.set, 0.002),
        )
        watcher.start()

        self.assertTrue(shutdown_requested.wait(timeout=1))
        watcher.join(timeout=1)
        self.assertFalse(watcher.is_alive())

    def test_active_request_prevents_idle_shutdown(self):
        activity = RuntimeActivity(idle_timeout=0.01)
        activity.begin_request()
        shutdown_requested = threading.Event()
        watcher = threading.Thread(
            target=activity.watch,
            args=(shutdown_requested.set, 0.002),
        )
        watcher.start()

        time.sleep(0.03)
        self.assertFalse(shutdown_requested.is_set())
        activity.end_request()
        self.assertTrue(shutdown_requested.wait(timeout=1))
        watcher.join(timeout=1)
        self.assertFalse(watcher.is_alive())

    def test_shutdown_endpoint_requires_local_marker_and_origin(self):
        activity = RuntimeActivity()
        app = create_app(
            config_repository=type("Config", (), {"load": lambda self: {}})(),
            printer_adapter=FakePrinter(),
            enable_cors=False,
        )
        app.extensions["printnum"]["activity"] = activity
        client = app.test_client()

        rejected = client.post("/shutdown")
        self.assertEqual(rejected.status_code, 403)
        self.assertFalse(activity._shutdown_requested.is_set())

        allowed = client.post(
            "/shutdown",
            headers={"X-PrintNum-Shutdown": "local-client"},
        )
        self.assertEqual(allowed.status_code, 202)
        self.assertTrue(activity._shutdown_requested.is_set())

        rejected_origin = client.post(
            "/shutdown",
            headers={
                "X-PrintNum-Shutdown": "local-client",
                "Origin": "https://untrusted.example",
            },
        )
        self.assertEqual(rejected_origin.status_code, 403)

    def test_shutdown_endpoint_stops_the_werkzeug_server_gracefully(self):
        app = create_app(
            config_repository=type("Config", (), {"load": lambda self: {}})(),
            printer_adapter=FakePrinter(),
            enable_cors=False,
        )
        server = make_server("127.0.0.1", 0, app, threaded=True)
        activity = app.extensions["printnum"]["activity"]
        watcher = threading.Thread(
            target=activity.watch,
            args=(server.shutdown,),
            kwargs={"poll_interval": 0.005},
        )
        server_thread = threading.Thread(target=server.serve_forever)
        watcher.start()
        server_thread.start()

        try:
            with urlopen(f"http://127.0.0.1:{server.server_port}/", timeout=1) as response:
                self.assertEqual(json.loads(response.read()), {"status": True})

            shutdown_request = Request(
                f"http://127.0.0.1:{server.server_port}/shutdown",
                method="POST",
                headers={"X-PrintNum-Shutdown": "local-client"},
            )
            with urlopen(shutdown_request, timeout=1) as response:
                self.assertEqual(response.status, 202)

            server_thread.join(timeout=1)
            self.assertFalse(server_thread.is_alive())
        finally:
            activity.stop()
            server.shutdown()
            server.server_close()
            watcher.join(timeout=1)
            server_thread.join(timeout=1)


class WindowsPrinterQueueTests(unittest.TestCase):
    def test_clear_queue_deletes_only_printnum_documents(self):
        deleted_jobs = []
        closed_handles = []
        printer_module = types.SimpleNamespace(
            PRINTER_ACCESS_ADMINISTER=0x00000004,
            JOB_CONTROL_DELETE=5,
            OpenPrinter=lambda name, defaults: ("handle", name),
            EnumJobs=lambda handle, first, count, level: [
                {"JobId": 10, "pDocument": "PrintNum: Ячейка: 1"},
                {"JobId": 11, "pDocument": "Word - Document"},
                {"JobId": 12, "pDocument": "PrintNum: Этикетка: QR"},
                {"JobId": 13, "pDocument": None},
            ],
            SetJob=lambda handle, job_id, level, job, command: deleted_jobs.append(
                (handle, job_id, command)
            ),
            ClosePrinter=closed_handles.append,
        )

        with patch.dict(sys.modules, {"win32print": printer_module}):
            WindowsPrinterAdapter().clear_queue("Label printer")

        self.assertEqual(
            deleted_jobs,
            [
                (("handle", "Label printer"), 10, printer_module.JOB_CONTROL_DELETE),
                (("handle", "Label printer"), 12, printer_module.JOB_CONTROL_DELETE),
            ],
        )
        self.assertEqual(closed_handles, [("handle", "Label printer")])


if __name__ == "__main__":
    unittest.main()
