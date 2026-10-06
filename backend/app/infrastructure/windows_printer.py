"""Адаптер для поиска принтеров Windows, проверки состояния и отправки заданий."""

import logging

from app.infrastructure.print_job import PRINTNUM_DOCUMENT_PREFIX


logger = logging.getLogger(__name__)


class WindowsPrinterAdapter:
    """Windows print spooler and GDI implementation of the printer port."""

    def list_printers(self):
        import win32print

        printers = win32print.EnumPrinters(
            win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
        )
        return [printer[2] for printer in printers]

    def is_online(self, printer_name):
        if not printer_name:
            return False

        import win32print

        handle = None
        try:
            handle = win32print.OpenPrinter(printer_name)
            info = win32print.GetPrinter(handle, 2)
            offline_attribute = 0x00000400
            if info["Attributes"] & offline_attribute:
                return False
            critical_status = (
                win32print.PRINTER_STATUS_ERROR
                | win32print.PRINTER_STATUS_PAPER_JAM
                | win32print.PRINTER_STATUS_PAPER_OUT
                | win32print.PRINTER_STATUS_OFFLINE
            )
            return not bool(info["Status"] & critical_status)
        except Exception:
            logger.exception("Не удалось проверить принтер %r", printer_name)
            return False
        finally:
            if handle is not None:
                win32print.ClosePrinter(handle)

    def clear_queue(self, printer_name):
        """Delete only PrintNum-owned jobs from the named Windows printer queue."""
        if not printer_name:
            raise ValueError("Не задан принтер для очистки очереди")

        import win32print

        handle = None
        try:
            handle = win32print.OpenPrinter(
                printer_name,
                {"DesiredAccess": win32print.PRINTER_ACCESS_ADMINISTER},
            )
            jobs = win32print.EnumJobs(handle, 0, -1, 1)
            for job in jobs:
                document = job.get("pDocument")
                if (
                    isinstance(document, str)
                    and document.startswith(PRINTNUM_DOCUMENT_PREFIX)
                ):
                    win32print.SetJob(
                        handle,
                        job["JobId"],
                        0,
                        None,
                        win32print.JOB_CONTROL_DELETE,
                    )
        except Exception:
            logger.exception("Не удалось очистить очередь принтера %r", printer_name)
            raise
        finally:
            if handle is not None:
                win32print.ClosePrinter(handle)

    def print_number(self, text, config):
        from app.infrastructure.windows_rendering import render_number_label

        render_number_label(text, config)

    def print_label(
        self,
        content,
        content_type,
        code_image,
        config,
        bold=False,
        underline=False,
        show_code_text=False,
    ):
        from app.infrastructure.windows_rendering import render_manual_label

        render_manual_label(
            content,
            content_type,
            code_image,
            config,
            bold=bold,
            underline=underline,
            show_code_text=show_code_text,
        )
