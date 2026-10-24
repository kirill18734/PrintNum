"""Structured auto-print progress, using fake printers only."""

import unittest
from unittest.mock import Mock, patch

from app.factory import create_app
from app.services.auto_print_service import AutoPrintService
from app.services.auto_print_status import AutoPrintStatus
from app.services.status_cache import PrinterStatusCache
from test_application import FakePrinter


def stage_statuses(steps):
    return [(step.get("stage"), step["status"]) for step in steps]


class AutoPrintProgressTests(unittest.TestCase):
    def setUp(self):
        self.config = {
            "running": True,
            "printer": "Test printer",
            "excludedTexts": ["skip"],
        }
        self.repository = Mock()
        self.repository.load.side_effect = lambda: self.config.copy()
        self.printer = Mock()
        self.printer.is_online.return_value = True
        self.service = AutoPrintService(
            self.repository, self.printer, PrinterStatusCache()
        )

    def test_progress_precedes_checks_and_formatting_waits_for_print(self):
        snapshots = []

        def load():
            self.assertEqual(stage_statuses(snapshots[-1]), [("received", "complete")])
            return self.config.copy()

        def online(_name):
            self.assertEqual(snapshots[-1][-1]["stage"], "exclusions")
            return True

        def print_number(_text, _config):
            self.assertEqual(
                stage_statuses(snapshots[-1]),
                [("received", "complete"), ("exclusions", "complete"),
                 ("readiness", "complete")],
            )

        self.repository.load.side_effect = load
        self.printer.is_online.side_effect = online
        self.printer.print_number.side_effect = print_number
        result = self.service.process("Order 1", on_progress=snapshots.append)
        self.assertEqual(result["status"], "printed")
        self.assertEqual(
            stage_statuses(result["steps"]),
            [("received", "complete"), ("exclusions", "complete"),
             ("readiness", "complete"), ("formatting", "complete"),
             ("result", "complete")],
        )
        self.assertEqual([len(snapshot) for snapshot in snapshots], [1, 2, 3, 4, 5])
        self.assertEqual(snapshots[-1], result["steps"])
        snapshots[-1][0]["message"] = "changed"
        self.assertEqual(result["steps"][0]["message"], "Текст получен")
        self.printer.print_number.assert_called_once_with("Order 1", self.config)

    def test_callback_cannot_mutate_accumulated_steps(self):
        def mutate(steps):
            steps[0]["message"] = "changed"
            steps.clear()

        result = self.service.process("Order 1", on_progress=mutate)
        self.assertEqual(len(result["steps"]), 5)
        self.assertEqual(result["steps"][0]["message"], "Текст получен")

    def test_early_exits_preserve_check_order_and_do_not_print(self):
        cases = [
            ("", {}, "ignored", [("result", "skipped")], "Получен пустой текст"),
            ("skip", {"printer": ""}, "skipped",
             [("exclusions", "skipped"), ("result", "skipped")],
             "Не напечатан: текст соответствует исключению"),
            ("Order 1", {"printer": ""}, "ignored",
             [("exclusions", "complete"), ("readiness", "blocked"),
              ("result", "blocked")], "Не напечатан: принтер не выбран"),
        ]
        for text, overrides, status, stages, message in cases:
            with self.subTest(text=text, overrides=overrides):
                self.config.update(running=True, printer="Test printer")
                self.config.update(overrides)
                snapshots = []
                result = self.service.process(text, on_progress=snapshots.append)
                self.assertEqual(result["status"], status)
                self.assertEqual(stage_statuses(result["steps"]), [("received", "complete")] + stages)
                self.assertEqual(result["steps"][-1]["message"], message)
                self.assertEqual(snapshots[-1], result["steps"])
        self.printer.is_online.assert_not_called()
        self.printer.print_number.assert_not_called()

    def test_offline_blocks_readiness_and_result(self):
        self.printer.is_online.return_value = False
        result = self.service.process("Order 1")
        self.assertEqual(result["status"], "ignored")
        self.assertEqual(
            stage_statuses(result["steps"]),
            [("received", "complete"), ("exclusions", "complete"),
             ("readiness", "blocked"), ("result", "blocked")],
        )
        self.assertEqual(result["steps"][-1]["message"], "Не напечатан: принтер недоступен")
        self.printer.print_number.assert_not_called()

    def test_rename_is_received_even_when_stopped_or_skipped(self):
        for running, text in ((True, "Order 1"), (False, "Order 1"), (True, "skip")):
            with self.subTest(running=running, text=text):
                self.config["running"] = running
                result = self.service.process(text, "П-123")
                self.assertEqual(result["steps"][1], {
                    "stage": "received", "status": "complete", "message": "Переименовано в П-123"
                })
        self.printer.print_number.assert_called_once_with("П-123", self.config)


class AutoPrintStatusTests(unittest.TestCase):
    def test_start_and_progress_are_snapshots_with_result_pending(self):
        status = AutoPrintStatus()
        event_id = status.start("original", "renamed")
        initial = status.latest()
        self.assertEqual(
            stage_statuses(initial["steps"]),
            [("received", "complete"), ("received", "complete"), ("result", "pending")],
        )
        steps = initial["steps"][:-1] + [
            {"stage": "exclusions", "status": "complete", "message": "checked"}
        ]
        status.progress(event_id, steps)
        steps[-1]["message"] = "changed"
        snapshot = status.latest()
        self.assertEqual(snapshot["steps"][-2]["message"], "checked")
        self.assertEqual(snapshot["steps"][-1]["stage"], "result")
        self.assertEqual(snapshot["status"], "processing")
        snapshot["steps"].clear()
        self.assertEqual(len(status.latest()["steps"]), 4)
        status.fail(event_id)
        self.assertEqual(status.latest()["steps"][:-1], initial["steps"][:-1] + [
            {"stage": "exclusions", "status": "complete", "message": "checked"}
        ])
        self.assertEqual(stage_statuses(status.latest()["steps"])[-1], ("result", "error"))

    def test_old_events_and_late_callbacks_cannot_overwrite_latest(self):
        status = AutoPrintStatus()
        old_id = status.start("old")
        new_id = status.start("new")
        expected = status.latest()
        result = {"status": "printed", "steps": [
            {"stage": "result", "status": "complete", "message": "printed"}
        ]}
        status.progress(old_id, result["steps"])
        status.finish(old_id, result)
        status.fail(old_id)
        self.assertEqual(status.latest(), expected)
        status.progress(new_id, result["steps"])
        self.assertEqual(status.latest()["steps"], result["steps"])
        status.finish(new_id, result)
        expected = status.latest()
        result["steps"].clear()
        status.progress(new_id, [])
        status.fail(new_id)
        status.finish(new_id, {"status": "ignored", "steps": []})
        self.assertEqual(status.latest(), expected)

    def test_legacy_steps_without_stage_remain_supported(self):
        status = AutoPrintStatus()
        event_id = status.start("Order 1")
        steps = [{"status": "complete", "message": "legacy"}]
        status.progress(event_id, steps)
        status.fail(event_id)
        self.assertEqual(status.latest()["steps"][0], steps[0])


class AutoPrintApiProgressTests(unittest.TestCase):
    def setUp(self):
        self.repository = Mock()
        self.repository.load.return_value = {
            "running": True, "printer": "Test printer", "excludedTexts": []
        }
        self.printer = FakePrinter()
        self.app = create_app(
            config_repository=self.repository, printer_adapter=self.printer, enable_cors=False
        )
        self.client = self.app.test_client()

    def event(self):
        return self.client.get("/auto-print-status").json["event"]

    def test_poll_during_print_reports_checks_but_not_formatting(self):
        original_print = self.printer.print_number

        def print_number(text, config):
            event = self.event()
            self.assertEqual(event["status"], "processing")
            self.assertEqual(stage_statuses(event["steps"]), [
                ("received", "complete"), ("received", "complete"),
                ("exclusions", "complete"), ("readiness", "complete"),
                ("result", "pending"),
            ])
            original_print(text, config)

        with patch.object(self.printer, "print_number", side_effect=print_number):
            response = self.client.post("/ozon-shelf", json={"text": "Ozon Полка - 123"})
        self.assertEqual(response.data, b"OK")
        self.assertEqual(self.event()["status"], "printed")
        self.assertEqual(stage_statuses(self.event()["steps"])[-2:], [
            ("formatting", "complete"), ("result", "complete")
        ])

    def test_errors_preserve_only_confirmed_stages(self):
        cases = [
            (self.repository, "load", []),
            (self.printer, "is_online", [("exclusions", "complete")]),
            (self.printer, "clear_queue", [("exclusions", "complete"), ("readiness", "complete")]),
            (self.printer, "print_number", [("exclusions", "complete"), ("readiness", "complete")]),
        ]
        for target, method, confirmed in cases:
            with self.subTest(method=method), patch.object(
                target, method, side_effect=RuntimeError("fake failure")
            ), self.assertLogs("app.api.auto_print", level="ERROR"):
                response = self.client.post("/ozon-shelf", json={"text": "Ozon Полка - 123"})
            self.assertEqual(response.status_code, 500)
            self.assertEqual(response.json, {"error": "Не удалось отправить этикетку на принтер"})
            event = self.event()
            self.assertEqual(event["status"], "error")
            self.assertEqual(stage_statuses(event["steps"]), [
                ("received", "complete"), ("received", "complete")
            ] + confirmed + [("result", "error")])
            self.assertEqual(self.printer.printed_numbers, [])


if __name__ == "__main__":
    unittest.main()
